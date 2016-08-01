function jboardify(id, type) {
    $('#' + id).jboard(type)
}


$('#search').jboard('standard')

$('#barcode').jboard('standard')

//$('#enter-platinum').jboard('standard')

$('#search').on( 'jpress', function(event, key){
    console.log(key)
})

$('#barcode').on( 'jpress', function(event, key){
    console.log(key)
})
