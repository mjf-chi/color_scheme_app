$('#post-form').on('submit', function(event){
    event.preventDefault();
    console.log("form submitted!")
    create_post();
});

function create_post(){
    console.log("create post running");
    console.log($('#post-text').val());
}
