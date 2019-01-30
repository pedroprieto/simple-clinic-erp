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
  currentNumber: { type: Number, default: 0, required: true}
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
  var counter = await invoiceNumber.findOneAndUpdate({doctor: mongoose.Types.ObjectId(doc.seller)}, {$inc: {currentNumber: 1} }, {upsert: true});
  doc.invoiceNumber = counter.currentNumber;
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

InvoiceSchema.statics.listByCustomer = function (patient) {
  return this.find({customer: patient}).sort({invoiceNumber: 1}).populate('orderItems.item').exec();
}

InvoiceSchema.statics.listBySeller = function (doctor) {
  return this.find({seller: doctor}).sort({invoiceNumber: 1}).populate('orderItems.item').exec();
}

var Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = Invoice;
