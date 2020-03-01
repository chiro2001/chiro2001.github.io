# blog.lanceliang2001.top
我的网站

# 项目构思

这个网站看上去是怎样的？

- 能够看文章
    - 加载渲染文章
        - 读取文章
        - 渲染Markdown
    - 编辑保存文章
- 能够看评论
    - 加载评论
    - 写评论
    - 管理评论
- 看上去有够好看
    - 使用MDUI
    - 实时加载MDUI
        - 使用Javasccript实时生成网页

# 技术实现

## 储存：腾讯云COS

**需要实现的api**
- 文章接口
- 主页接口
- 评论接口

**目录结构**
- {{网站域名}}
    - articles
        - {{数字:发表时间}}
            - content.md
            - info.json
                - {标题...}
    - comments
        - {{数字:发表时间}}
            - comment.md
            - info.json
                {姓名、联系方式、内容}
    - index.json {主页显示}
    - secury.json {管理员密码}

**主页缓存index.json**
- articles
    - 时间
    - 标题
    - 内容
- comments
    - 时间
    - 发送者
    - 内容
*注意要有裁剪内容*

## MDUI

使用mdui.org主页的模板。

## Markdown渲染

- [x]测试√

# v0.1已经更新

完成了基本操作。用全异步实现了。

# v0.2 规划

## 计划的新功能

- 鉴权认证系统：输入密码之后才能发布文章，申请到的appkey不一样。
    - service-q8rodpb4-1254016670.gz.apigw.tencentcs.com/{{password}}
    - cache 操作
    - flask 后台
- div分行
- 分页
    - 先获取现在最大页数
    - 每页n个文章
- TAGS系统，有文章分类
    - tags存在于info.json里面...