module.exports = (res, data , err) => {
    if (!err) {
        res.json({
            Status: 200,
            Success: true,
            Message: data.Message,
            Data: data.Data,
            Other: data.Other
        });
    } else {
        if(err.code == 11000){
            res.json({
                Status: 500,
                Success: false,
                Message: err.message,
            });
        }
        else{
            res.json({
                Status: 300,
                Success: false,
                Message: err.message,
            });
        }
       
    }
}


