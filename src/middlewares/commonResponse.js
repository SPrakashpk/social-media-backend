const commonResponse = (req, res, next) => {
    res.sendSuccess = (data = {},message = "Success", status = 200, ) => {
        res.status(status).json({ success: true, message, data });
    };

    res.sendError = (message = "Error", status = 500, error = {},) => {
        res.status(status).json({ success: false, message, error });
    };

    next();
};

export default commonResponse;