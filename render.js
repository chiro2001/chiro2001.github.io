//创建实例
var converter = new showdown.Converter();
//应用一些特殊的类
var map_table = {
    'mdui-text-color-theme': new Array('h1', 'h2'),
    'mdui-text-color-theme-accent': new Array('strong', 'em'),
    'mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent': new Array('button'),
    'mdui-textfield-input': new Array('input', 'textarea')
}

function render() {
    var dist = $('#contain-dist');
    dist.html(converter.makeHtml($('#contain-src').val()));
    
    for (mclass in map_table) {
        var arr = map_table[mclass];
        for (j in arr) {
            console.log(mclass);
            $(arr[j], dist).addClass(mclass);
        }
    }
    
    dist.mutation();
}