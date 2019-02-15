let routes = require('express').Router();
module.exports.routes = ()=>{
    return routes
    // .get('/box/getPage', require('/box/getPage').main());
    .get('/box/getPage', (req, res)=>{
        console.log("check")
        res.status(200).json({data:"all good"})
    });
}
