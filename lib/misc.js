function pad(num,places = 1) {
    var calc_array = [10,100,1000];
    var rtn = `${num}`;
    var count = 1
    for(const number of calc_array) {
        if(num < number) {
            rtn = `0${rtn}`;
        }
        if(count === places) {
            return rtn;
        }
        ++count;
    }
}

exports.pad = pad;

exports.isoDate = function isoDate(date) {
    date = (typeof date === 'string') ? new Date(date) : date;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(),2)}Z`;
}
