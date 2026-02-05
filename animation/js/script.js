let currentText = "";
let intervalid=null;
let i=0;
function submit(){
    currentText = document.getElementById("text").value;
    document.getElementById("display").innerHTML="";
    i=0;
}

document.getElementById("range").addEventListener("input",() =>{
    var val = document.getElementById("range").value;
    var p = document.getElementById("display");
    clearInterval(intervalid);
    let speed = 1000;
    intervalid=setInterval(()=>{
        p.innerHTML += currentText.charAt(i);
        i++;
        if(i>currentText.length) {
            submit();
        }
    },speed/val);
})