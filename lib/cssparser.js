
var grunt = require("grunt");
var mod_url = require('url');
var mod_path = require('path');
var mod_md5 = require('MD5');





    // hosts:data.lionhosts[0], // css cdn主机列表
    // image_versions:data.imglist // 数据库图片列表


function strEndWith(str,substr){
    return str.lastIndexOf(substr) + substr.length === str.length;
}



/**
 * @param {Object} opt
 * @param {String} opt.cwd css文件的根目录
 * @param {String} opt.host 绝对路径的host地址
 * @param {String} image_version 所有图片文件的结果集，参考DianPing. DP_StaticFileVersion
 */
function CssParser(opt) {
    if(!opt.hosts){
      grunt.fail.warn('please specify a `hosts` array in the option,' + 
         ' for example: hosts:["i1.cdn.com","i2.cdn.com","i3.cdn.com"]');
    }

    this.opt = opt;
    this.cwd = opt.cwd;
    this.hosts = opt.hosts.map(function(h){
        return (opt.https?"https":"http") + "://" + h;
    });
    this.opt.src = this.normalize_path(opt.source);

    this._logs = [];
}

CssParser.prototype = {
    /**
     * 连接器，处理相对图片路径的各部分，将之拼装为目标格式
     * @param  {[type]} parsed {host,ext,name,version}
     * @return {String}        [description]
     */
    connector:function (parsed){
        var self = this,
            opt = this.opt,
            src = opt.source,
            root = opt.root,
            csspath = parsed.csspath,
            hash = parsed.hash,
            host = parsed.host,
            md5 = parsed.md5,
            ext = parsed.ext,
            name = parsed.name,
            version = parsed.version,
            ret;

        root = this.normalize_path(root);
        name = mod_path.relative(src,name);
        name = mod_path.join(root,name);
        ret = (host||"")+name;
        if(!opt.no_version){
            ret+= "." + version;
        }

        if(opt.md5){
            ret+= "." + md5;
        }

        ret += ext;
        hash && (ret += hash);
        return ret;
    },
    normalize_path: function(path){
        if(path.indexOf("/") !== 0){
            path = "/" + path;
        }

        if(strEndWith(path,"/")){
            path = path.slice(0,path.length-1);
        }

        return path;
    },
    /**
     * 分析path下的所有图片路径
     * 并将相对路径转为绝对路径
     * @param  {String} path css文件的路径
     * @return {Object} {content:String}
     */
    parse: function(csspath) {
        var self = this;

        /**
         * 获取文件内容
         * @type {String}
         */
        var content = grunt.file.read(csspath);

        /**
         * 匹配
         * 1. url(a.png)
         * 2. url('http://i1.static.dp/s/c/i/b.png')
         * 3. url("./c.png")
         */
        var reg = /url\(\s*(['"]?)([^?"'\)]*)\1\s*\)/g;

        /**
         * 用以标识文件是否有修改
         * 有修改为1，反之为0
         */
        // var changed = 0;

        /**
         * 返回所有匹配
         * 例：matches[0] 为 "url(a.png)"
         */
        var matches = {};

        var m;

        /**
         * 涉及的所有图片路径
         * @type {Array}
         */
        var image_paths = [];

        /**
         * 判断路径是否为相对路径
         * 例：  http://i2.static.dp/s/c/i/a.png 返回 true
         *      c/i/a.png 返回false
         */

        function isRelative(imgpath) {
            return !/^http:\/\//.test(imgpath);
        }

        /**
         * 将文件content中的相对地址替换为绝对地址
         */
        function replaceMatch(match,i) {
            /**
             * 匹配 url('path/to/image.png')
             * 中的 path/to/image.png
             */
            
            var reg = /\(\s*(['"]?)([^?'"\)]*)\1\s*\)/,
                parsed = "",
                imgpath = match.match(reg)[2],
                parsed_url;

            /**
             * 若非相对路径则取得其相对路径进行parse
             */
            parsed = self.calculateImagePath(csspath,imgpath,!isRelative(imgpath));

            if(!parsed){
                return;
            }
            // image_paths.push((parsed.name+parsed.ext).substr(1));

            parsed_url = "url(" + self.connector(parsed) + ")";

            if(parsed_url !== match){
                matches[match] = parsed_url;
            }
        }


        while(m = reg.exec(content)){
            replaceMatch(m[0]);
        }

        var key_regx;
        for(var key in matches){
            key_regx = key.replace(/([\.\?\*\+\$\[\]\\\(\)\{\}\-\/])/g, "\\$1");
            key_regx = new RegExp(key_regx,"g");
            content = content.replace(key_regx,matches[key]);
        }

        /**
         * 循环处理所有匹配
         */
        // matches && matches.forEach(replaceMatch);

        return content;
    },

    /**
     * 计算CDN域名
     * @param  {[type]} path [description]
     * @return {[type]}      [description]
     */
    calculateCDNHost:function(path){
        var hosts = this.hosts,
            count = hosts.length;
        return hosts[parseInt(mod_md5(path),16) % count];
    },

    /**
     * 计算文件的绝对路径
     * 若:
     * 1.当前css文件路径为 /s/c/a.css
     * 2.host为 http://i2.static.dp
     * 则
     * 1. i/pic.png -> http://i2.static.dp/s/c/i/pic.png
     * 2. ./i/pic.png -> http://i2.static.dp/s/i/pic.png
     * 3. ../pic.png -> http://i2.static.dp/s/pic.png
     *
     * 若absolute为true，则忽略csspath
     */
    calculateImagePath:function(csspath,imgpath,absolute) {
        var host
            , cssroot
            , fullpath
            , url_parsed
            , opt = this.opt;


        url_parsed = mod_url.parse(imgpath);
        hash = url_parsed.hash;
        if(absolute){
            fullpath = url_parsed.pathname;
            host = url_parsed.host;
        }else{
            cssroot = mod_path.dirname(csspath);
            fullpath = mod_path.join(cssroot,url_parsed.pathname);
        }

        var ext = mod_path.extname(fullpath);


        var name = fullpath.split(ext)[0];
        var version_match = name.match(/([\w\/\.\-\_]+)(\.v\d+)/);
        var version;
        if(version_match){
            version = version_match[2];
            name = version_match[1];
        }



        var real_full_path = fullpath;
            real_full_path = real_full_path.replace(/^(.*)(\.v\d+)+(\.(png|jpg|gif))$/,"$1$3");


        var warn_message;

        if(absolute){
            return false;
        }
        if(!grunt.file.exists(real_full_path)){
            warn_message  = "image not exists " + csspath + " -> " + fullpath;
            if(opt.allow_image_miss){
                grunt.log.warn(warn_message);   
            }else{
                grunt.fail.warn(warn_message);
            }
            return false;
        }else{
            var parsed = {
                hash:hash,
                csspath:csspath,
                absolute:absolute,
                ext:ext,
                md5:mod_md5(grunt.file.read(real_full_path)),
                name:name
            };
            parsed.host = (host || this.calculateCDNHost(
                mod_url.parse(this.connector(parsed)).pathname
            ));
            return parsed;
        }
        
    }
};


module.exports = CssParser;
