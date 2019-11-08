//储存当前页的学生集合
var tableData = [];

//设置每页展示的学生数量
var size = 10;

//设置当前页
var curpage = 1;

//绑定事件
function bindEvent() {
	$('.menu-list').on('click', 'dd', function () {
		console.log(1);
		if (!$(this).hasClass('active')) {
			$(this).siblings().removeClass('active');
			var id = $(this).addClass('active').data('id');
			$('.content-main').fadeOut();
			$("#" + id).fadeIn();
			if (id == 'stu-list') {
				store.requestData('/api/student/findByPage', { page: curpage, size: size }, function (data) {
					tableData = data.findByPage;
					store.randerData(data.findByPage);
					$('.page').createPage({
						pageCount: Math.ceil(data.cont / size),
						current: curpage,
						backFn: function (p) {
							curpage = p;
							store.requestData('/api/student/findByPage', { page: curpage, size: size }, function (data) {
								tableData = data.findByPage;
								$('tbody').hide();
								store.randerData(data.findByPage);
								$('tbody').fadeIn();
							});
						}
					})
				});
			}
		}
	});
	$('.submit').on('click', function () {
		var obj = store.getFormData($('.form-mes')[0]);
		if (obj) {
			store.requestData('/api/student/addStudent', obj, function (res) {
				alert('成功添加该学生信息');
				$('.form-mes')[0].reset();
				$('.list').trigger('click');
			});
		}
		return false;
	});
	$('#table-body').on('click', '.btn', function () {
		var isEdit = $(this).hasClass('edit');
		index = $(this).data('index');
		if (isEdit) {
			store.renderEditModel(tableData[index]);
			$('.mask').show();
			$('.edit-content').slideDown();
		} else {
			var isDel = confirm('确认删除' + tableData[index].name + '学生的信息？');
			if (isDel) {
				store.requestData('/api/student/delBySno', {
					sNo: tableData[index].sNo,
				}, function (res) {
					alert('删除成功');
					if (tableData.length == 1) {
						curpage -= 1;
						if (curpage == 0) {
							$('tbody').html('');
							return;
						}
					}
					store.findByPageToRenderData(curpage);
				})
			}
		}
	})
	$('.edit-submit').on('click', function () {
		var obj = store.getFormData($('.edit-form')[0]);
		if (obj && tableData[index].sNo !== obj.sNo) {
			alert('学好不能修改，请重新填写！');
		}
		if (obj) {
			store.requestData('/api/student/updateStudent', obj, function (res) {
				alert('成功修改该学生信息');
				$('.form-mes')[0].reset();
				$(".close").trigger('click');
				store.requestData('/api/student/findByPage', { page: curpage, size: size }, function (data) {
					tableData = data.findByPage;
					$('tbody').hide();
					store.randerData(data.findByPage);
					$('tbody').fadeIn();
					$('.page').createPage({
						pageCount: Math.ceil(data.cont / size),
						current: curpage,
						backFn: function (p) {
							curpage = p;
							store.requestData('/api/student/findByPage', { page: curpage, size: size }, function (data) {
								tableData = data.findByPage;
								$('tbody').hide();
								store.randerData(data.findByPage);
								$('tbody').fadeIn();
							});
						}
					})
				});
			});
		}
		return false;
	});
	$(".close").on('click', function () {
		$('.edit-content').slideUp(function () {
			$('.mask').hide();
		});
	});
	$('#search-submit').on('click', function () {
		var val = $('#search-word').val();
		store.requestData('/api/student/searchStudent', {
			sex: -1,
			search: val,
			page: 1,
			size: size
		}, function (data) {
			if (data.searchList.length == 0) {
				alert('对不起，查无此人！请重新查询');
				return;
			}
			$('#search-word').val('');
			tableData = data.searchList;
			$('tbody').hide();
			store.randerData(data.searchList);
			$('tbody').fadeIn();
			$('.page').createPage({
				pageCount: Math.ceil(data.cont / size),
				current: 1,
				backFn: function (p) {
					curpage = p;
					store.requestData('/api/student/searchStudent', {
						sex: -1,
						search: val,
						page: curpage,
						size: size
					}, function (data) {
						tableData = data.searchList;
						$('tbody').hide();
						store.randerData(data.searchList);
						$('tbody').fadeIn();
					});
				}
			})
		});
	});
	$('#all').on('click', function () {
		store.findByPageToRenderData(1);
	});
}

//创建商店管理功能函数
function creatStore() {
	function renderEditModel(data) {
		var form = $('.edit-form')[0];
		for (var prop in data) {
			if (form[prop]) {
				form[prop].value = data[prop];
			}
		}
	}
	function requestData(url, data, cb) {
		$.ajax({
			url: 'http://open.duyiedu.com' + url,
			type: "get",
			data: $.extend({
				appkey: 'dongmeiqi_1547441744650'
			}, data),
			dataType: 'json',
			success: function (res) {
				if (res.status == 'success') {
					cb(res.data);
				} else {
					alert(res.msg);
				}
			}
		});
	}
	function randerData(res) {
		var str = '';

		var data;

		if (res instanceof Array) {
			data = res;
		} else {
			data = res.data.findByPage;
		}
		tempData = data;
		data.forEach(function (ele, index) {
			str += '<tr>\
	        <td>'+ ele.sNo + '</td>\
	        <td>'+ ele.name + '</td>\
	        <td>'+ (ele.sex ? "女" : "男") + '</td>\
	        <td>'+ ele.email + '</td>\
	        <td>'+ (new Date().getFullYear() - ele.birth) + '</td>\
	        <td>'+ ele.phone + '</td>\
	        <td>'+ ele.address + '</td>\
	        <td>\
	            <button class="btn edit" data-index="'+ index + '">编辑</button>\
	            <button class="btn delete" data-index="'+ index + '">删除</button>\
	        </td>\
	    </tr>'
		});
		$('tbody').html(str);
	};
	function getFormData(form) {
		var name = form.name.value;
		var sNo = form.sNo.value;
		var birth = form.birth.value;
		var sex = form.sex.value;
		var phone = form.phone.value;
		var email = form.email.value;
		var address = form.address.value;
		if (!name || !sNo || !birth || !phone || !email || !address) {
			alert('部分数据未填写，请填写完成后提交');
			return false;
		}
		if (parseInt(birth) > new Date().getFullYear()) {
			alert('请填写正确年份');
			return false;
		}
		return {
			name: name,
			sNo: sNo,
			birth: birth,
			sex: sex,
			phone: phone,
			email: email,
			address: address
		}
	}
	function findByPageToRenderData(num) {
		requestData('/api/student/findByPage', { page: num, size: size }, function (data) {
			tableData = data.findByPage;
			$('tbody').hide();
			randerData(data.findByPage);
			$('tbody').fadeIn();
			$('.page').createPage({
				pageCount: Math.ceil(data.cont / size),
				current: num,
				backFn: function (p) {
					curpage = p;
					requestData('/api/student/findByPage', { page: curpage, size: size }, function (data) {
						tableData = data.findByPage;
						$('tbody').hide();
						randerData(data.findByPage);
						$('tbody').fadeIn();
					});
				}
			})
		});
	}
	//返回功能函数集合
	return {
		renderEditModel: renderEditModel,
		requestData: requestData,
		randerData: randerData,
		getFormData: getFormData,
		findByPageToRenderData: findByPageToRenderData
	}
}
var store = creatStore();
//初始化
store.findByPageToRenderData(1);
bindEvent();