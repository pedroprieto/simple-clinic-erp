
var output = {};

// Function to convert CJ template object to plain object
// ctx: Koa context object
function parseTemplate(ctx) {
	if ((typeof ctx.request.body.template === 'undefined') || (typeof ctx.request.body.template.data === 'undefined') || (!Array.isArray(ctx.request.body.template.data))) {
    ctx.throw(400, 'Los datos no están en formato CJ');
	}

  var CJdata = ctx.request.body.template.data;

  // Convert CJ format to JS object
	var data = CJdata.reduce(function(a,b){
	  a[b.name] = b.value;
	  return a;
	} , {});

  return data;
}


output.parseTemplate = parseTemplate;

module.exports = output;
