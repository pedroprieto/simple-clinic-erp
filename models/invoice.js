var baseschema = require('./baseschema');
var mongoose = require('mongoose');
var moment = require('moment');

// To keep track of invoiceNumbers and invoiceBatches
var InvoiceNumerationSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  year: {
    type: Number, default: 0, required: true
  },
  currentNumber: {
    type: Number, default: 0, required: true
  }
});
var invoiceNumber = mongoose.model('InvoiceNumeration', InvoiceNumerationSchema);

// Invoice data should be immutable. If error, generate another invoice
var invoiceSchema = {
  invoiceNumber: {
    type: Number,
    promptCJ: "Número de factura",
    required: true,
    htmlType: ""
  },
  // paid: {
  //   type: Boolean,
  //   promptCJ: "Pagada",
  //   required: true,
  //   htmlType: "checkbox",
  //   default: false
  // },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    promptCJ: "Paciente",
    htmlType: "select"
  },
  customerName: {
    type: String,
    promptCJ: "Cliente",
    required: true,
    htmlType: "text"
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    promptCJ: "Médico",
    htmlType: "select"
  },
  sellerName: {
    type: String,
    promptCJ: "Vendedor",
    required: true,
    htmlType: "text"
  },
  date: {
    type: Date,
    promptCJ: "Fecha",
    required: true,
    htmlType: "date",
    default: Date.now
  },
  incomeTax: {
    type: Number,
    promptCJ: "IRPF %",
    required: true,
    htmlType: "number",
    default: 0
  },
  orderItems: [
    {
      kind: String,
      price: Number,
      tax: {
        type: Number,
        default: 0
      },
      description: String,
      // Reference to order
      item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'orderItems.kind'
      }
    }
  ]
};


var InvoiceSchema = baseschema(invoiceSchema);

InvoiceSchema.virtual('orderItemsCalc').get(function() {
  return this.orderItems.map(function(el) {
    return {
      netPrice: Math.round(el.price/(1+el.tax/100) * 100) / 100,
      price: el.price,
      tax: el.tax,
      taxPrice: Math.round(el.tax * el.price/(1+el.tax/100)) / 100,
      description: el.description
    }

  })

});

InvoiceSchema.virtual('netTotal').get(function () {
  return this.orderItemsCalc.reduce(function(res, el) {
    return (res + el.netPrice);
  }, 0);
});

InvoiceSchema.virtual('taxTotal').get(function () {
    return this.orderItemsCalc.reduce(function(res, el) {
        return (res + el.taxPrice);
    }, 0);
});

InvoiceSchema.virtual('incomeTaxTotal').get(function () {
  return Math.round(this.netTotal * this.incomeTax) / 100;
});

InvoiceSchema.virtual('amountDue').get(function () {
  var totalWithoutIncomeTax = this.orderItemsCalc.reduce(function(res, el) {
    return (res + el.price);
  }, 0);
  return totalWithoutIncomeTax - this.incomeTaxTotal;
});

InvoiceSchema.virtual('subTotals').get(function () {
  var test = {};
  test.orderItems = [];
  test.orderItems.push(
    {
      price: 10,
      tax: 21
    }
  );
  test.orderItems.push(
    {
      price: 15,
      tax: 21
    }
  );
  test.orderItems.push(
    {
      price: 50,
      tax: 0
    }
  );
  test.orderItems.push(
    {
      price: 40,
      tax: 10
    }
  );
  return this.orderItemsCalc.reduce(function(res, el) {
    if (res[el.tax]) {
      res[el.tax].price += el.netPrice;
      res[el.tax].tax += el.taxPrice;
    } else {
      res[el.tax] = {};
      res[el.tax].price = el.netPrice;
      res[el.tax].tax = el.taxPrice;
    }
    if (el.tax == 0) {
      res[el.tax].isZero = true;
    }
    return res;
  }, {});
});

InvoiceSchema.virtual('dateLocalized').get(function () {
  return moment(this.date).format('LL');
});

// Invoice numeration
InvoiceSchema.pre('validate',async function(next) {
  var doc = this;
  var invoiceYear = this.date.getFullYear();
  var counter = await invoiceNumber.findOneAndUpdate({doctor: mongoose.Types.ObjectId(doc.seller), year: invoiceYear }, {$inc: {currentNumber: 1} }, {upsert: true, new: true});
  doc.invoiceNumber = counter.year * 1000000 + counter.currentNumber;
  next();
});

// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
InvoiceSchema.methods.invoiceToCJ = function() {
  var data = [];
  data.push({name: 'invoiceNumber', prompt: "Número", value: this.invoiceNumber});
  data.push({name: 'date', prompt: "Fecha", value: this.dateLocalized});
  // data.push({name: 'paid', prompt: "Pagada", value: this.paid});
  data.push({name: 'seller', prompt: "Vendedor", value: this.sellerName});
  data.push({name: 'customer', prompt: "Cliente", value: this.customerName});

  if (Array.isArray(this.orderItems)) {
    var item = this.orderItems[0];
    data.push({name: 'price', prompt: "Precio", value: item.price + '€'});
    data.push({name: 'tax', prompt: "IVA", value: item.tax + '%'});
    data.push({name: 'description', prompt: "Descripción", value: item.description});
  }
  data.push({name: 'IRPF', prompt: "IRPF", value: this.incomeTax + '%'});
  return data;
};

InvoiceSchema.statics.list = function () {
  return this.find().populate('orderItems.item').exec();
}

InvoiceSchema.statics.listByCustomer = function (patient, dateStart, dateEnd) {
    return this.find(
        {
            customer: patient,
            date: {$gte: dateStart, $lte: dateEnd},
        }).sort({invoiceNumber: -1}).populate('orderItems.item').exec();
}

InvoiceSchema.statics.listBySeller = function (doctor, dateStart, dateEnd) {
    return this.find(
        {
            seller: doctor,
            date: {$gte: dateStart, $lte: dateEnd},
        }).sort({invoiceNumber: -1}).populate('orderItems.item').exec();
}

InvoiceSchema.statics.incomeStats = async function (doctor, period, dateStart, dateEnd) {
    var periodString;
    switch (period) {
    case 'day':
        periodString = "YYYY-MM-DD";
        break;
    case 'week':
        periodString = "GGGG-[W]WW";
        break;
    case 'year':
        periodString = "YYYY";
        break;
    case 'quarter':
        periodString = "YYYY-[Q]Q";
        break;
    case 'month':
    default:
        periodString = "YYYY-MM";
        break;
    };
    var invoiceList = await this.find(
        {
            seller: doctor,
            date: {$gte: new Date(dateStart), $lte: new Date(dateEnd)},
        });

    var grouped = invoiceList.reduce(function(acc, el) {
        var d = moment(el.date).format(periodString);
        if (!acc[d])
            acc[d] = {
                gross:0,
                incomeTax: 0,
                net: 0,
                tax: 0,
                benefits: 0
            };
        acc[d].gross += el.amountDue;
        acc[d].incomeTax += el.incomeTaxTotal;
        acc[d].net += el.netTotal;
        acc[d].tax += el.taxTotal;
        acc[d].benefits += (el.netTotal - el.incomeTaxTotal);
        return acc;
    }, {});

    var dates = [];
    var gross = [];
    var incomeTax = [];
    var net = [];
    var tax = [];
    var benefits = [];
    Object.keys(grouped).sort().forEach(function(g) {
        if (period== "quarter") {
            var nd = moment(g,"YYYY-[Q]Q");
            dates.push(nd.format("YYYY-MM"));
        } else {
            dates.push(g);
        }
        gross.push(grouped[g].gross);
        incomeTax.push(grouped[g].incomeTax);
        net.push(grouped[g].net);
        tax.push(grouped[g].tax);
        benefits.push(grouped[g].benefits);
    });

    return {
        x: dates,
        gross: gross,
        incomeTax: incomeTax,
        net: net,
        tax: tax,
        benefits: benefits
    }
}


var Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = Invoice;
