function add_domin (prefix) {
    host = document.domain;
    if (host == '') {
        host = 'localhost';
    }
    return host + '/' + prefix;
}

//基础封装
function CBase() {
    this.Bucket = 'blog-1254016670';
    this.Region = 'ap-chengdu';
    this.cos = new COS({
        SecretId: 'AKID2sTqzvX7NPCrHRP1RecKn00mJbfUOMQE',
        SecretKey: 'iBOM5Ymk5C5jvsZ0DArITO9euufCamkT'
    });
}

CBase.prototype.listdir = function (prefix) {
    return new Promise((resolve, reject) => {
        this.cos.getBucket({
            Bucket: this.Bucket,
            Region: this.Region,
            Prefix: prefix,
            Delimiter: '/'
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

CBase.prototype.listdirAll = function (prefix) {
    return new Promise((resolve, reject) => {
        this.cos.getBucket({
            Bucket: this.Bucket,
            Region: this.Region,
            Prefix: prefix
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