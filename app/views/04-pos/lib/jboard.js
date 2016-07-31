$('#search').jboard('standard')

$('#barcode').jboard('standard')


$('#search').on( 'jpress', function(event, key){
    console.log(key)
})

$('#barcode').on( 'jpress', function(event, key){
    console.log(key)
})
