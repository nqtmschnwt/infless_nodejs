fetch("/getcustoken", {
  method: "POST",
  headers: {'Content-Type': 'application/json'},
}).then(res => res.json())
.then(res => {
  console.log(res);
})
.catch(err => {
  console.log(err);
});
