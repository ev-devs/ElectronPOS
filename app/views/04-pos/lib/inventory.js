/**********************************************NOTE: BEGIN SEARCH INVENTORY CODE*********************************************/
var search_param = "";
$("#search").on( 'jpress', function(event , key){

	if (key == "enter" || key=="shift" || key == "123" || key == "ABC"){
		// do nothing
	}
	else {

		if(current_platinum != "NONE") {
			var query = $(this).val();
			if(scan_flag == 1) {
				query = new RegExp(query, "i");
				var i = -1;
				inventory_query.splice(0, inventory_query.length);
				$("#item_list").empty();
			  inventory.find(function(e) {
					i++;
					if(e.barcode != null) {
						if((e.title.search(query) != -1) || (e.barcode.search(query) != -1)) {
							var item = Object.assign({}, e)
							inventory_query.push(item);
							item.title+=("-_" + i);
							console.log(item);
						}
					}
			});
				$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/inventory.html', 'utf-8') , {"query_results" : inventory_query}));
			}
		}
		else {
			error_platinum();
		}
	}

});

$(document).on("click",  ".item", function() {
  $("#selected_item").text($($(this).children()[0]).text().trim());
  $("#selected_item").removeClass();
  $("#selected_item").addClass($($(this).children()[0]).attr("id"));
	search_param = Number($($(this).children()[0]).attr("id"))
	$('#modal3').openModal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .5, // Opacity of modal background
		in_duration: 300, // Transition in duration
		out_duration: 200, // Transition out duration
	});
});

$(document).on("click",  "#confirm_item_selection", function() {
	var quantity = $("#selected_item_qnt").val();
	var barcode = inventory[search_param].barcode;
	if(quantity != 0 && quantity != "") {
		//var i = -1
		var i = find_in_customer_list("barcode", barcode)
			if(i != -1/*undefined*/) {
				item_list[i].cust_quantity+=Number(quantity);
				add_item(i, Number($("#selected_item").attr("class")), quantity, 0)
			}
			else {
				var item = inventory[Number($("#selected_item").attr("class"))]
				item['cust_quantity'] = Number(quantity);
				item_list.push(item);
				add_item(item_list.length - 1, Number($("#selected_item").attr("class")), quantity, 1);
				f = 1;
			}
		}
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});

$(document).on("click",  "#cancel_item_selection", function() {
	$('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/partials/handle_order.html', 'utf-8') , {"platinum" : current_platinum.replace(/1/g, " ").replace(/2/g, ",")}));
});
