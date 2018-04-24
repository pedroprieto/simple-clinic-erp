var baseschema = require('./baseschema');
var mongoose = require('mongoose');

// To keep track of invoiceNumbers and invoiceBatches
var InvoiceNumerationSchema = mongoose.Schema({
  batchName: {type: String, required: true},
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
  paid: {
    type: Boolean,
    promptCJ: "Pagada",
    required: true,
    htmlType: "checkbox",
    default: false
  },
  customerName: {
    type: String,
    promptCJ: "Cliente",
    required: true,
    htmlType: "text"
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
  orderItems: [
    {
      kind: String,
      price: Number,
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

// Invoice numeration
InvoiceSchema.pre('validate',async function(next) {
  var doc = this;
  var counter = await invoiceNumber.findOneAndUpdate({batchName: 'invoice'}, {$inc: {currentNumber: 1} }, {upsert: true});
  doc.invoiceNumber = counter.currentNumber;
  next();
});

// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
InvoiceSchema.methods.invoiceToCJ = function() {
  var data = [];
  data.push({name: 'invoiceNumber', prompt: "Número", value: this.invoiceNumber});
  data.push({name: 'date', prompt: "Fecha", value: this.date});
  data.push({name: 'paid', prompt: "Pagada", value: this.paid});
  data.push({name: 'seller', prompt: "Vendedor", value: this.sellerName});
  data.push({name: 'customer', prompt: "Cliente", value: this.customerName});

  if (Array.isArray(this.orderItems)) {
    var item = this.orderItems[0];
    data.push({name: 'price', prompt: "Precio", value: item.price});
    data.push({name: 'description', prompt: "Descripción", value: item.description});
  }
  return data;
};

InvoiceSchema.statics.list = function () {
  return this.find().populate('orderItems.item').exec();
}

var Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = Invoice;
