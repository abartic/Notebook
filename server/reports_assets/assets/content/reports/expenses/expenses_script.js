function padNumber(value) {
    if (isNumber(value)) {
        return `0${value}`.slice(-2);
    } else {
        return "";
    }
}

function isNumber(value) {
    return !isNaN(toInteger(value));
}

function toInteger(value) {
    return parseInt(`${value}`, 10);
}

function toUserFormatDate(date) {
    var stringDate = "";
    if (date) {
        stringDate += isNumber(date.day) ? padNumber(date.day) + "/" : "";
        stringDate += isNumber(date.month) ? padNumber(date.month) + "/" : "";
        stringDate += date.year;
    }
    return stringDate;
}


function total(items) {
    var sum = 0;
    items.forEach(function(i) {

        sum += i.debit;
    });
    return sum;
}