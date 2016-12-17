'use strict';

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

var GirlUserSchema = new Schema({
    account: {type: String},  //nickname
    qq: {},        //QQ登陆
    weChat: {},    //微信登陆
    hashed_password: {type: String},
    provider: {type: String},                   // 1:快速登录   2:微信  3:QQ  4:手机   5:微博
    status: {type: Number},                                 //0 不可见  1 可见  2 删除
    session:{type: String},
    vipEndTime: {type: Date},                               //vip截止时间
    register_at: {type: Date, require: true, default: Date.now},
    lastLogin_at: {type: Date, require: true, default: new Date()}
}, {autoIndex: false, versionKey: false});

GirlUserSchema.virtual('password').set(function (password) {
    this._password = password;
    this.hashed_password = this.encryptPassword(password);
}).get(function () {
    return this._password;
});

/**
 * Methods
 */
GirlUserSchema.methods = {

    /**
     * Authenticate - check if the passwords are the same
     */
    authenticate: function (plainText) {
        if(this.hashed_password &&  typeof this.hashed_password === 'string'){
            return bcrypt.compareSync(plainText, this.hashed_password);
        }
        return false;
    },

    /**
     * Encrypt password
     */
    encryptPassword: function (password) {
        return bcrypt.hashSync(password, 8);
    }
};

mongoose.model('GirlUser', GirlUserSchema);
