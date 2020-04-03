function add_domin (prefix) {
    host = document.domain;
    if (host == '') {
        host = 'localhost';
    }
    return host + '/' + prefix;
}

login = false;
cbase_login_url = 'https://service-q8rodpb4-1254016670.gz.apigw.tencentcs.com/';

function formLoginUrl(passwd) {
    return cbase_login_url + passwd;
}

//基础封装
function CBase() {
//    // 已经输入了全局变量，就请求秘钥
//    // service-q8rodpb4-1254016670.gz.apigw.tencentcs.com
//    if (typeof password != 'undefined'? true : false) {
//        console.log('use password:', password)
//        $.ajax({
//            'url': formLoginUrl(password)
//        }).then(d => {
//            console.log('got token:', d);
//            this.cos = new COS({
//                SecretId: d.id,
//                SecretKey: d.key
//            });
//            if (d.code == 0) {
//                login = true;
//            } else {
//                login = false;
//                password = undefined;
//            }
//        })
//    }
    this.Bucket = 'bed-1254016670';
    this.Region = 'ap-guangzhou';
    this.cos = new COS({
        SecretId: 'AKID2sTqzvX7NPCrHRP1RecKn00mJbfUOMQE',
        SecretKey: 'iBOM5Ymk5C5jvsZ0DArITO9euufCamkT'
    });
}

CBase.prototype.listdir = function (prefix, count = 10, marker = undefined) {
    return new Promise((resolve, reject) => {
        this.cos.getBucket({
            Bucket: this.Bucket,
            Region: this.Region,
            Prefix: prefix,
            Delimiter: '/',
            MaxKeys: count,
            Marker: marker
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

CBase.prototype.listdirAll = function (prefix, count = 10, marker = undefined) {
    return new Promise((resolve, reject) => {
        this.cos.getBucket({
            Bucket: this.Bucket,
            Region: this.Region,
            Prefix: prefix,
            MaxKeys: count,
            Marker: marker
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

CBase.prototype.read = function (key) {
    return new Promise((resolve, reject) => {
        this.cos.getObject({
            Bucket: this.Bucket,
            Region: this.Region,
            Key: key
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

CBase.prototype.write = function (key, fileObject) {
    return new Promise((resolve, reject) => {
        this.cos.putObject({
            Bucket: this.Bucket,
            Region: this.Region,
            Key: key,
            StorageClass: 'STANDARD',
            Body: fileObject,
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

CBase.prototype.delete = function (key) {
    return new Promise((resolve, reject) => {
        this.cos.deleteObject({
            Bucket: this.Bucket,
            Region: this.Region,
            Key: key
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};