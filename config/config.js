'use strict';

module.exports = {
    wxPay: {
        appId: 'wx8684544c6fc01fcb', //appId
        partnerId: '1310255601',  //商户号
        md5Key: 'pye3Pyhaja4KQyckXcPfRSTfn2emrNew',
        notifyUrl: 'http://ts-pay749.meiquapp.com:8000/order/notify/weixin'
    },
    aliPay: {
        appId: '2016120804023415', //appId
        partner: '2088522422093751',
        publicKey: '-----BEGIN PUBLIC KEY-----\n'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDwNunejy87Q/OVkgiDyZJuEXc2\n'
        + 'XBEIL0lyispxVjQJPBDqe/VQrgg3BXF3wPLF79Mpsw3CeRWrTFBzgD380P6Zz26p\n'
        + 'wk1hwmZBnBo0D1NlyRMQN5n8WPfR/2TPgtvQj3Lv4Z6SM2OSkM1C8vLQqBQVkkMl\n'
        + 'uW/TSW5Ed/6g/hBQnwIDAQAB\n'
        + '-----END PUBLIC KEY-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\n'
        + 'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAPA26d6PLztD85WS\n'
        + 'CIPJkm4RdzZcEQgvSXKKynFWNAk8EOp79VCuCDcFcXfA8sXv0ymzDcJ5FatMUHOA\n'
        + 'PfzQ/pnPbqnCTWHCZkGcGjQPU2XJExA3mfxY99H/ZM+C29CPcu/hnpIzY5KQzULy\n'
        + '8tCoFBWSQyW5b9NJbkR3/qD+EFCfAgMBAAECgYBiwyEaiSIxKrn+d+EaVgjnSjUK\n'
        + 'W4YBKHf5KQkc2gVg+po13is5NaRZAtrpEqJ+MSFPlreEioYXPLQjGMnjpQXX6V6R\n'
        + 'YU/hYys0101BSrRNNUwTBWFItjenu+ImZhx+JsiQobML+IusUWP7tPICOaNBwskJ\n'
        + '2KRFIbh8AlWr3CmW2QJBAPnd6zDVFD7/awZP3AxVbxGPYoiK7yhjlJGwn+c1Og6N\n'
        + 'R2mcQYezG9Efcjxib9iS/NukwkJuuHbBF615AB1nm8sCQQD2HFexwFTbYiAu6hl1\n'
        + 'ZT0X5czQUX1v9xPd5AxqGGymUtZ1toBoH2znwCkUwgmTxwdE+LxIHdjSHC0AeIPy\n'
        + '+Ov9AkEArq2t1h2gYco+D9OUiirP0v7ia4J1X07+djt8Di7vv2yVGAfc5/kW4UOS\n'
        + 'oRRQDJ/1lbfA9qBg5ORooSWOJwBfsQJBAKHtpAVf9nUh6urzPCzxn3DJ0ih+dXnl\n'
        + 'pzynf0OPLm2As3pfyby4cH9K/7yYrpR8r1vCDJ+mg7I6t6FHqgmDnkECQGUxB6l7\n'
        + 'wWPGxNMRhlrWXQCG8P+8L8kssI8twEmsJY1FArrfyOWGz4d+LAoXRYRErLu49Z/I\n'
        + 'MJ/XlVvCGnPXd28=\n'
        + '-----END PRIVATE KEY-----',
        notifyUrl: 'http://ts-pay749.meiquapp.com:8000/order/notify/alipay'
    },
    wxLogin:{
        AppID: 'wxdfa578473977cc42',
        AppSecret: 'e4c8ccab64dd0cdf92b524f6cf1678e0'
    }
};
