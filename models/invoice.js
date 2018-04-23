var baseschema = require('./baseschema');
var mongoose = require('mongoose');

var invoiceSchema = {
  paid: {
    type: Boolean,
    promptCJ: "Pagada",
    required: true,
    htmlType: "checkbox",
    default: false
  },
  date: {
    type: Date,
    promptCJ: "Fecha",
    required: true,
    htmlType: "date",
    default: Date.now
  },
  customer: {
    type: String,
    promptCJ: "Cliente",
    htmlType: "text"
  },
  seller: {
    type: String,
    promptCJ: "Vendedor",
    htmlType: "text"
  },
  orderItems: [
    {
      kind: String,
      price: Number,
      description: String,
      item: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'orderItems.kind'
      }
    }
  ]
};


var InvoiceSchema = baseschema(invoiceSchema);

// Convert mongoose object to plain object ready to transform to CJ item data format
// Assume populated object
InvoiceSchema.methods.invoiceToCJ = function() {
  var data = [];
  data.push({name: 'date', prompt: "Fecha", value: this.date});
  data.push({name: 'customer', prompt: "Cliente", value: this.customer});
  data.push({name: 'paid', prompt: "Pagada", value: this.paid});
  data.push({name: 'seller', prompt: "Vendedor", value: this.seller});
  if (Array.isArray(this.orderItems)) {
    var item = this.orderItems[0];
    data.push({name: 'price', prompt: "Precio", value: item.price});
    data.push({name: 'description', prompt: "Descripción", value: item.description});
  }
  return data;
};

InvoiceSchema.statics.list = function () {
  return this.find().populate('orderItems').exec();
}

var Invoice = mongoose.model('Invoice', InvoiceSchema);

module.exports = Invoice;
