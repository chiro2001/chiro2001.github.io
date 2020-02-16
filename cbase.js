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
        SecretId: 'AKIDcq7HVrj0nlAWUYvPoslyMKKI2GNJ478z',
        SecretKey: '70xZrtGAwmf6WdXGhcch3gRt7hV4SJGx'
    });
}

CBase.prototype.listdir = function (prefix, callback) {
    this.cos.getBucket({
        Bucket: this.Bucket,
        Region: this.Region,
        Prefix: add_domin(prefix)
    }, callback);
};

CBase.prototype.read = function (key, callback) {
    this.cos.getObject({
        Bucket: this.Bucket,
        Region: this.Region,
        Key: key
    }, callback);
};

CBase.prototype.write = function (key, fileObject, callback) {
    this.cos.putObject({
        Bucket: this.Bucket,
        Region: this.Region,
        Key: key,
        StorageClass: 'STANDARD',
        Body: fileObject,
//        onProgress: function (progressData) {
//            console.log(JSON.stringify(progressData));
//        }
    }, callback);
}

CBase.prototype.delete = function (prefix, callback) {
    this.cos.deleteObject({
        Bucket: this.Bucket,
        Region: this.Region,
        Key: prefix
    }, callback);
};