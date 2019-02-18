 const handlebars = require('handlebars');
 const HandlebarsIntl = require('handlebars-intl');
 HandlebarsIntl.registerWith(handlebars);




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

 function toDate(date) {
     return date ? new Date(date.year, date.month - 1, date.day) : null;
 }


 function total(items) {
     var sum = 0;
     items.forEach(function(i) {
         sum += i.credit_value;
     });
     return sum;
 }



 function total_discount(items) {
     var sum = 0;
     items.forEach(function(i) {
         if (i.discount_value)
             sum += i.discount_value;
     });
     return sum;
 }


 //  function formatNum(num) {

 //      var context = {
 //          value: num,
 //          date: new Date()
 //      };

 //      var intlData = {
 //          "locales": "ro-RO"
 //      };

 //      var template = handlebars.compile("{{formatNumber value}}");
 //      var html = template(context, {
 //          data: {
 //              intl: intlData
 //          }
 //      });

 //      return html;
 //  }