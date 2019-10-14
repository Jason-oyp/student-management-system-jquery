//立即执行函数  在函数内需要做两件事情  一件是扩展名为createPage的插件  另一件是实现插件功能
(function ($) {
    // init作为实现功能的入口函数  传入参数 dom为父级元素  args为参数
    function init(dom, args) {
        // 判断可以实现的条件  当前选中页数小于总页数
        //console.log(args.pageCount);
        if (args.current <= args.pageCount) {
            // fillHtml根据当前页数渲染html结构
            fillHtml(dom, args);
            // 每一个按钮绑定上点击事件
            bindEvent(dom, args);
        } else {
            //alert('请输入正确页数')
        }
    }
    function fillHtml(dom, args) {
        // 每次在渲染之前清空父级元素 重新根据操作渲染每一个按钮
        dom.empty();
        // 渲染上一页按钮 如果大于1上一页按钮为可按的 
        if (args.current > 1) {
            dom.append('<a href = "#" class="prevPage">上一页</a>');
            // 如果当前页数为第一页 则为不能点击的按钮显示 
        } else {
            dom.remove('.prevPage');
            dom.append('<span class="disabled">上一页</span>');
        }
        //中间页数
        // 插入第一页  
        if (args.current != 1 && args.current >= 4) {
            dom.append('<a href = "#" class="tcdNumber">' + 1 + '</a>');
        }
        // 插入...
        if (args.current - 2 > 2 && args.current <= args.pageCount && args.pageCount >= 5) {
            dom.append('<span>...</span>');
        }
        // 根据循环生成中间页数 start为开始页数
        var start = args.current - 2;
        // end为开始页数
        var end = args.current + 2;
        for (; start <= end; start++) {
            // 生成大于1与总页数之间的页数
            if (start <= args.pageCount && start >= 1) {
                // 除了选中后其他页数样式显示
                if (start != args.current) {
                    dom.append('<a href = "#" class="tcdNumber">' + start + '</a>');
                    // 当前选中页数显示
                } else {
                    dom.append('<span class="current">' + start + '</span>');
                }
            }
        }

        // 生成尾部与中间...
        if (args.current + 2 < args.pageCount - 1 && args.pageCount >= 5) {
            dom.append('<span>...</span>')
        }

        // 插入最后一页
        if (args.current != args.pageCount && args.current < args.pageCount - 2) {
            dom.append('<a href="#" class="tcdNumber">' + args.pageCount + '</a>');
        }
        // 渲染下一页按钮 可以点击的即为当前选中页数小于总页数
        if (args.current < args.pageCount) {
            dom.append('<a href = "#" class="nextPage">下一页</a>');
        } else {
            // 如果当前页数为最后一页 则为不能点击的按钮显示
            dom.remove('.nextPage');
            dom.append('<span class="disabled">下一页</span>');
        }
    }
    function bindEvent(obj, args) {
        //点击页码  相当于修改参数  将当前选中页数为点击这一页
        obj.off('click');
        obj.on('click', '.tcdNumber', function () {
            var current = parseInt($(this).text());
            changePage(obj, args, current);
        })
        //上一页
        // a.prevPage   规定只能添加到指定的子元素上的事件处理程序
        // 点击上一页将current切换为当前current-1
        obj.on('click', '.prevPage', function () {
            var current = parseInt(obj.children('.current').text());
            changePage(obj, args, current - 1);
        })
        //下一页
        // 点击上一页将current切换为当前current+1
        obj.on('click', '.nextPage', function () {
            var current = parseInt(obj.children('.current').text());
            changePage(obj, args, current + 1);
        })
    }

    // 抽取出点击
    function changePage(dom, args, page) {
        // 改变参数后再次调用fillHtml根据参数渲染结构
        fillHtml(dom, { 'current': page, 'pageCount': args.pageCount });

        //同时 切换页数后  如果回调函数存在 执行回调函数
        if (typeof (args.backFn == "function")) {
                args.backFn(page);
        }
    }
    // 在jquery的原型上扩展createPage方法  利用extend方法进行参数合并
    // 再调用init方法 ，将参数传递过去，init函数为初始化函数 实现生成翻页插件结构
    $.fn.createPage = function () {
        if(arguments[0].pageCount == 0){
            return 0;
        }
        init(this, arguments[0])
    }
})(jQuery)
