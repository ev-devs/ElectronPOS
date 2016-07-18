/*This function merely searches the inventory by barcode to see if it exists. If so then see if the item is already
in the customers list. If so the increment the counter and if not then add to list.
@return: index of the item in the item_list
@param: item_list, inventory, and barcode*/
function determine_item_status(item_list, inventory, barcode) {
  var i = -1;
  /*Check the inventory by bar code(which as we wrote right now has two entries) and store the result*/
  var inv_result = inventory.find(function(e) {
    return e.barcode == barcode;
  });

  /*If it's in the inventory go here*/
  if(inv_result != undefined) {
    /*Check the customers current list to see if they already have it in their choices*/
    //console.log("In inventory");
    var flag = 0;
    cus_result = item_list.find(function(e) {
      /*This i will keep track of where it is in the list*/
      i++;
      return e.barcode == barcode;
    });
    /*If the customer already has one then just increment the quantity counter*/
    if(cus_result != undefined) {
      item_list[i].cust_quantity+=1;
    }
    /*If not then increment the counter to one and add to the customer's list called item_list*/
    else {
      inv_result['cust_quantity'] = 1;
      item_list.push(inv_result);
      i = item_list.length - 1;
    }
    /*return the place of the item in the list for future use*/
    return i;
  }
  else {
    return -1;
  }
};

/*Corresponds to a button on the modal. If this button is pressed then deleting is confirmed. All deleting is handled here.*/
$("#y_delete").click(function() {
  var i = -1;
  /*Find the item by name in the list of customer items named "item_list"*/
	console.log(item_id);
	/*Grab the item info by id and using the find function to find the element in the id*/
  var item = $("#" + item_id).find("span").text().trim();
	/*Gte the quantity of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*Get the item name*/
  var item_name = item.substring(item.indexOf(": ") + 2, item.length);
  item_list.find(function(e) {
    /*This i will keep track of where it is in the list*/
    i++;
    return e.title == item_name;
  });
	/*If the cust_quantity value is one*/
  if(item_list[i].cust_quantity == 1) {
		/*Do price updates*/
    subtotal-= item_list[i].price;
    tax = subtotal * .075;
    total = subtotal + tax;
		/*Make cust_quantity 0*/
    item_list[i].cust_quantity = 0;
		/*Remove from gui and item_list*/
    $("#" + item_id).remove();
    item_list.splice(i, 1);
  }
	/*If the cust_quantity value is greater than one*/
  else if(item_list[i].cust_quantity > 1) {
		/*Gran the value to be deleted*/
    var delete_quantity = $("#delete-quantity").val();
    /*Do any pricing updates before deleting (can write into a function honestly)*/
    subtotal-=(item_list[i].price * delete_quantity);
    tax = subtotal * .075;
    total = subtotal + tax;
		/*If the quantity of items to be deleted is less than than the current quantity*/
    if(delete_quantity < item_qnt) {
      item_list[i].cust_quantity-=delete_quantity;
			/*In the item info replace the old quantity with the new quantity*/
      item = item.replace(item_qnt.toString(), item_list[i].cust_quantity.toString());
			/*Take the title of the item and replace all the spaces with underscores because thats how the id is*/
      $("#" + item_list[i].title.replace(/ /g, "_")).text(item);
    }
		/*If the quantity to delete matches the current quantity available*/
    else if(delete_quantity == item_qnt) {
			/*Make tthe cust_quantity value 0*/
      item_list[i].cust_quantity = 0;
			/*Removet hat item from the gui*/
      $("#" + item_id).remove();
			/*Remove that item from the item_list*/
      item_list.splice(i, 1);
    }
		/*Remove the form from the modal*/
		$("#delete-form").remove();
  }
	/*If the there aren't any items after deletion then there is nothing to cancel so lower the flag*/
	if(item_list.length == 0)
		cancel_flag = 0;
	/*Updates the subtotal in the gui with the accounting package*/
  $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",").toString());
	/*Updates the tax in the gui with the accounting package*/
  $("#tax").text("$" + accounting.formatNumber(tax, 2, ",").toString());
	/*Updates the total in the gui with the accounting package*/
  $("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
	/*Removes the red from the item*/
	$("#" + item_id).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

$("#n_delete").click(function() {
  /*Grab the item name*/
  var item = $("#qnt-item-"+ item_num).text().trim().toString();
	/*Grab the number of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*If there are more than one items do this*/
  if(item_qnt >= "1") {
		/*Remove the form from the modal*/
    $("#delete-form").remove();
  }
	/*Removes the red from the item*/
	$("#" + item_num).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

/*BEGIN SEARCH INVENTORY CODE*/
$("#search").change(function() {
  console.log("Changed");
});

/*BEGIN CANCEL ORDER CODE*/
$("#cancel").click(function() {
  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1)
    $('#modal2').openModal();
});

/*BEGIN CANCEL ORDER CODE*/
$("#cancel").click(function() {
  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1)
    $('#modal2').openModal();
});

/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/ /*MAY NEED TO GO IN BACKEND.JS*/
$(document).on("change", "#tendered", function() {
  if($(this).val() >= total)
    $("#change").text("$" + accounting.formatNumber(Number($(this).val()) - total, 2, ",").toString())
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Voids the order to reset the variables in anticipation for a new  transaction*/
	void_order();
	/*Render platinums list FIX*/
}

/*A function that voids an order. Used to cancel orders and void orders aftercash or card has been paid*/
function void_order() {
    item_list.splice(0, item_list.length);/*Empties the item list*/
		/*Empties the left side*/
    $("#sale_list tbody").empty();
		/*Empties the subtotal and total*/
    subtotal = 0;
    tax = 0;
    total = 0;
    $("#subtotal").text("$" + subtotal.toString());
    $("#tax").text("$"+tax.toString());
    $("#total").text("$"+total.toString());

}
