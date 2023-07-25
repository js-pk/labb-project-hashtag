 module.exports = (obj) => {
    if (obj === undefined || obj === null) {
        return true;
    }
    
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}