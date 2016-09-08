/*This starts the sid-nav*/
$(".button-collapse").sideNav();

/*Used to trigger the modal located in _index.ejs*/
$('.modal-trigger').leanModal({
     dismissible: true, // Modal can be dismissed by clicking outside of the modal
     opacity: 0, // Opacity of modal background
     in_duration: 300, // Transition in duration
     out_duration: 200, // Transition out duration
   }
 );
