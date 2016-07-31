$('#keyboard-1').jboard('standard')

$('#keyboard-1').on( 'jpress', function(event, key){
    console.log(key)
})
