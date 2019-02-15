// 'use-strict';
//
// const jwt = require('jsonwebtoken');
// const secret = require('../secret').token_secret;
// // const algo = require('../config/config').algo;
//
// module.exports.verify = (token)=>{
//   return jwt.verify(token, secret.secret, function(err, decoded){
//     if(err){
//       console.log('token websocket verify ERROR', err);
//       return { success: 'false', message: 'Fail to authenticate token !' }
//     }else{
//       return decoded
//     }
//   });
// }
// module.exports.tokenFn = (req, res, next)=>{
//   // Check headers or url parameters or post parameters for token
//   const token = req.headers['x-access-token'] || req.query.token || req.body.token;
//   // Decode token
//   if(token){
//      jwt.verify(token, secret.secret, function(err, decoded){
//        if(err){
//          console.log('token ERROR 1');
//          console.log(err);
//          return res.status(401).json({
//             success: 'false', message: 'Fail to authenticate token !'
//          });
//        }else{
//          req.decoded = decoded;
//          next();
//        }
//      });
//
//   }
//   // Trow error
//   else {
//      console.log('token ERROR 2');
//      return res.status(401).json({
//         success: false,
//         message: 'No token provided.'
//      })
//   }
// }
// module.exports.valid = this.tokenFn;
