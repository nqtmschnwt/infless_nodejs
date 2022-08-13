// Page navigation button
if(document.getElementById("changePageBtn")!=null){
  document.getElementById("changePageBtn").addEventListener("click", pageNavigation);
}
if(document.getElementById("pageNavigation-close")!=null){
  document.getElementById("pageNavigation-close").addEventListener("click", pageNavigationClose);
}
function pageNavigation(){
  let pageNavigationModal = document.getElementById("pageNavigation-wrapper");
  if (pageNavigationModal!=null) {
    if(pageNavigationModal.style.display==="none") pageNavigationModal.style.display = 'block';
    else pageNavigationModal.style.display = 'none';
  }
}
function pageNavigationClose() {
  let pageNavigationModal = document.getElementById("pageNavigation-wrapper");
  if (pageNavigationModal!=null) {
    if(pageNavigationModal.style.display==="block") pageNavigationModal.style.display = 'none';
  }
}

// NAV change button
if(document.getElementById("nav-change")!=null){
  document.getElementById("nav-change").addEventListener("click", clientNavFormToggle);
}
if(document.getElementById("nav-change-cancel")!=null){
  document.getElementById("nav-change-cancel").addEventListener("click", clientNavFormToggle);
}
function clientNavFormToggle(){
  let clientNavDisplay = document.getElementById("clientNavDisplay");
  let clientNavForm = document.getElementById("clientNavForm");
  if (clientNavDisplay.style.display === "none") {
    clientNavDisplay.style.display = "block";
    clientNavForm.style.display = "none";
  } else {
    clientNavDisplay.style.display = "none";
    clientNavForm.style.display = "block";
    document.getElementById("clientNavInput").focus();
  }
}

// Open Noti button
if(document.getElementById("ddk-noti")!=null){
  document.getElementById("ddk-noti").addEventListener("click", openNoti);
}
if(document.getElementById("ddk-noti-close")!=null){
  document.getElementById("ddk-noti-close").addEventListener("click", closeNoti);
}

// Get the modal
var imgModal = document.getElementById("imgModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var modalImg = document.getElementById("modal-img");
var captionText = document.getElementById("caption");

document.addEventListener("click", (e) => {
  const elem = e.target;
  if (elem.id==="myImg") {
    imgModal.style.display = "block";
    modalImg.src = elem.dataset.biggerSrc || elem.src;
    captionText.innerHTML = elem.alt;
  }
})

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
if(span != undefined){
  span.onclick = function() {
    imgModal.style.display = "none";
  }
}

var welcome = document.getElementById('welcomeModal');

function welcomeClose() {
  welcome.style.display = "none";
}

function closeNoti() {
  document.getElementById("ddk-noti-container").style.display = "none";
}
function openNoti() {
  document.getElementById("ddk-noti-container").style.display = "block";
}
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("hieu-qua");
  switching = true;
  dir = "desc";
  if(table != null) {
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if (dir == "asc") {
          if (parseInt(x.innerHTML.toLowerCase()) > parseInt(y.innerHTML.toLowerCase())) {
            shouldSwitch= true;
            break;
          }
        } else if (dir == "desc") {
          if (parseInt(x.innerHTML.toLowerCase()) < parseInt(y.innerHTML.toLowerCase())) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
  }
}
sortTable(0);

$('tr th:nth-child(1)').hide();
$('tr td:nth-child(1)').hide();

function addZero(numb) {
  if(numb<10){
    return "0"+numb;
  } else {
    return ""+numb;
  }
}

document.getElementById("loading").style.display="none";
function toggleRespMenu() {
  var x = document.getElementById("mobileNav");
  if (x.className === "mobileNav") {
    x.className += " responsive";
  } else {
    x.className = "mobileNav";
  }
}
function goodDatetimeFormat(dateString){
  //var dateString = "2010-08-09 01:02:03";
  var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  var dateArray = reggie.exec(dateString);
  var dateObject = new Date(
      (+dateArray[1]),
      (+dateArray[2])-1, // Careful, month starts at 0!
      (+dateArray[3]),
      (+dateArray[4]),
      (+dateArray[5]),
      (+dateArray[6])
  );
  var dateObjectFormated = addZero(dateObject.getDate())  + "/" + addZero((dateObject.getMonth()+1)) + "/" + dateObject.getFullYear() + " " + addZero(dateObject.getHours()) + ":" + addZero(dateObject.getMinutes());
  return(dateObjectFormated);
}
function goodDateFormat(dateString){
  //var dateString = "2010-08-09";
  var reggie = /(\d{4})-(\d{2})-(\d{2})/;
  var dateArray = reggie.exec(dateString);
  var dateObject = new Date(
      (+dateArray[1]),
      (+dateArray[2])-1, // Careful, month starts at 0!
      (+dateArray[3])
  );
  var dateObjectFormated = addZero(dateObject.getDate())  + "/" + addZero((dateObject.getMonth()+1)) + "/" + dateObject.getFullYear();
  return(dateObjectFormated);
}

const clientTable = document.getElementById('clientTable');
if(clientTable!=null){
  clientTable.addEventListener('click', (event) => {
    const isButton = event.target.nodeName === 'BUTTON';
    if (!isButton) {
      return;
    }

    console.log(parseInt(event.target.id.split('-')[1]));
    let cmd = event.target.id.split('-')[0];
    let cmd_id = event.target.id.split('-')[1];

    if(cmd=='clientInfo'){
      clientInfoFill(cmd_id);
      document.getElementById('client-form-wrapper').style.display='block';
    }

    if(cmd=='clientResetPsw'){
      document.getElementById('client-form-wrapper').style.display='block';
    }

  })
}

function clientInfoFill(id){
  let name = document.getElementById('name-'+id).innerHTML;
  let phone = document.getElementById('phone-'+id).innerHTML;
  let email = document.getElementById('email-'+id).innerHTML;
  let ref = document.getElementById('ref-'+id).innerHTML;
  let expireString = document.getElementById('expire-'+id).innerHTML;
  let datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;
  let expireDate = new Date(expireString.replace(datePattern,'$3-$2-$1'));
  let expireStringISO = expireDate.getFullYear().toString() + '-' + (expireDate.getMonth()+1).toString().padStart(2, '0') + '-' + expireDate.getDate().toString().padStart(2, '0');
  let phongthan = document.getElementById('phongthan-'+id).innerHTML;
  let ddk = document.getElementById('ddk-'+id).innerHTML;
  let sl = document.getElementById('sl-'+id).innerHTML;
  let personalsltp = document.getElementById('personalsltp-'+id).innerHTML;

  console.log(expireDate);

  document.getElementById('id-input').value = ''+id;
  document.getElementById('name-input').value = name;
  document.getElementById('phone-input').value = phone;
  document.getElementById('email-input').value = email;
  document.getElementById('ref-input').value = ref;
  document.getElementById('expire-input').value = expireStringISO;
  document.getElementById('phongthan-input').value = phongthan;
  document.getElementById('ddk-input').value = ddk;
  document.getElementById('sl-input').value = sl;
  document.getElementById('personalsltp-input').value = personalsltp;
}

const clientFormCloseBtn = document.getElementById('client-form-close');
if(clientFormCloseBtn!=null){
  clientFormCloseBtn.addEventListener('click', (event) => {
    document.getElementById('client-form-wrapper').style.display='none';
  })
}

// Generate favicon badge
var favicon = new Favico({
  animation :'none',
  bgColor   :'#dd2c00',
  textColor :'#fff0e2'
});

// Update favicon
function showFaviconBadge() {
    var num = generateNum();
    favicon.badge(num);
}

function newUpdate() {
    update = showFaviconBadge();
}

document.body.addEventListener('click', function(){
  console.log("Clicked!")
  favicon.badge(0);
});

// Get the modal
var modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
var span = document.getElementById("modal-close");
// When the user clicks on <span> (x), close the modal
if(span!=null){
  span.onclick = function() {
    modal.style.display = "none";
  }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function goodDatetimeFormat(dateString){
  //var dateString = "2010-08-09 01:02:03";
  var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
  var dateArray = reggie.exec(dateString);
  var dateObject = new Date(
      (+dateArray[1]),
      (+dateArray[2])-1, // Careful, month starts at 0!
      (+dateArray[3]),
      (+dateArray[4]),
      (+dateArray[5]),
      (+dateArray[6])
  );
  var dateObjectFormated = addZero(dateObject.getDate())  + "/" + addZero((dateObject.getMonth()+1)) + "/" + dateObject.getFullYear() + " " + addZero(dateObject.getHours()) + ":" + addZero(dateObject.getMinutes());
  return(dateObjectFormated);
}
function goodDateFormat(dateString){
  //var dateString = "2010-08-09";
  var reggie = /(\d{4})-(\d{2})-(\d{2})/;
  var dateArray = reggie.exec(dateString);
  var dateObject = new Date(
      (+dateArray[1]),
      (+dateArray[2])-1, // Careful, month starts at 0!
      (+dateArray[3])
  );
  var dateObjectFormated = addZero(dateObject.getDate())  + "/" + addZero((dateObject.getMonth()+1)) + "/" + dateObject.getFullYear();
  return(dateObjectFormated);
}
