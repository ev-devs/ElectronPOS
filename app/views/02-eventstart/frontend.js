

$('.seminar').click(function(event){
    $($('.convention').children()[0]).css('background-color', 'grey')
    $($(this).children()[0]).css('background-color', '#00c853')
});

$('.convention').click(function(event){
    $($('.seminar').children()[0]).css('background-color', 'grey')
    $($(this).children()[0]).css('background-color', '#00c853')
});

/*This starts the sid-nav*/
$(".button-collapse").sideNav();
//$(".keyboard").keyboard();

$('#event_id').jboard('standard')
