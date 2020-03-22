(function () {
  // new variable
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users'
  const data = [] //用來存放 Index API 回傳的 JSON 資料。
  const favoriteUser = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('searchForm')
  const searchInput = document.getElementById('search-friend')
  const home =  document.getElementById('home')
  const nav =  document.querySelector('nav')
  const navHeartIcon =  document.querySelector('.nav-favorite')
  const userModal =  document.getElementById('show-user-modal')
  const pagination = document.getElementById('pagination')
  const filter = document.getElementById('filter')
  const viewMode =  document.querySelector('.switch-mode')
  const itemPerPage = 20
  let cardMode = true;
  let favoritePage = false;
  let paginationData = []
  let dataNow = []
  let pageNow = 1
  let gender;
  

  axios.get(INDEX_URL).then((response)=>{
    //測試從哪抓出資料
    //console.log(response.data)
    //console.log(...response.data.results)
    data.push(...response.data.results)  
    getTotalPages(data)
    getPageData(1, data)
    dataNow = data
  })

 //listen to dataPanel
 dataPanel.addEventListener('click', event => {
   let id = event.target.dataset.id
   if (event.target.matches('.card-image')){
     showUserInfo(id)
     console.log(id)
   }
   //add/cancel like
   if (event.target.matches('.fa-heart-o')){
     event.target.classList = 'fa fa-heart btn btn-favorite'
     addFavoriteUser(id)
   } else if (event.target.matches('.fa-heart')){
     event.target.classList = 'fa fa-heart-o btn btn-favorite'
     removeFavoriteUser(id)
   }

 })
  
 //listen to filter
  filter.addEventListener('click', event => {
    let results = []
    //Enable filter at favorite page
    if (favoritePage === true){
      dataNow = favoriteUser
    } else {
      dataNow = data
    }
    //filter by button
    if (event.target.matches('#filter-male')) {
      results = dataNow.filter(file => file.gender === 'male')
    } else if (event.target.matches('#filter-female')) {
      results = dataNow.filter(file => file.gender === 'female')    
    } else {
      return
    }
    getTotalPages(results)
    getPageData(1, results) 
    dataNow = results//for view-mode
  })
  
  viewMode.addEventListener('click', event => {
    if (event.target.matches('#list-view')){
      cardMode = false
      getPageData(pageNow, dataNow)
    } else {
      cardMode = true
      getPageData(pageNow, dataNow)
    }
  })

 //listen to search bar
 searchForm.addEventListener('submit', event => {
   event.preventDefault()
   let result = []
   //Enable search at favorite page
    if (favoritePage === true){
      dataNow = favoriteUser
    } else {
      dataNow = data
    }
   const regex = new RegExp(searchInput.value, 'i')
   result = dataNow.filter(user => user.name.match(regex))
   //displayDataList(result)
    getTotalPages(result)
    getPageData(1, result)
   searchInput.value = ''
    dataNow = result
 })
 
 //listen to nav 
 nav.addEventListener('click', e => {
   //back to main page
   if (e.target.matches('#home')){
     navHeartIcon.classList = 'fa fa-heart-o btn nav-favorite'
     favoritePage = false;
     getTotalPages(data)
     getPageData(1, data) 
     dataNow = data
   } 
   //show favorite users
   if (e.target.matches('.fa-heart-o')){
     event.target.classList = 'fa fa-heart btn nav-favorite'
     favoritePage = true;
     getTotalPages(favoriteUser)
     getPageData(1, favoriteUser)
     dataNow = favoriteUser
   } else if (e.target.matches('.fa-heart')){
     event.target.classList = 'fa fa-heart-o btn nav-favorite'
     favoritePage = false;
     getTotalPages(data)
     getPageData(1, data) 
     dataNow = data
   }
 })
 
 //listen to pagination
 pagination.addEventListener('click', event => {
   pageNow = event.target.dataset.page
   //console.log(pageNow)
   if (event.target.tagName === 'A') {
     getPageData(pageNow)
     showNowPageActive(pageNow)
   }
 })
 
 function displayDataCard(data){
   let htmlContent = ''
   data.forEach(function(item, index){
     htmlContent += `
       <div class="col-sm-6 col-md-4 col-lg-3">
         <div class="card mb-3 p-1">
           <div class="zooming">
             <img class="card-img-top card-image" src="${item.avatar}" alt="Card image cap"  data-id="${item.id}" data-toggle="modal" data-target="#show-user-modal">
           </div>
           <div class="card-body">
             <h5 class="card-text">
             <i class="fa fa-${item.gender}"></i> ${item.name} ${item.surname}</h5>
             <p class="card-text"><i class="fa fa-home" style="color: gray"></i> ${item.region}</p>
              <i class="fa fa-heart-o btn btn-favorite" id="favorite" style="font-size:25px"  data-id="${item.id}"></i>
           </div>
         </div>
       </div>
`
   })
   dataPanel.innerHTML = htmlContent
 }
  
   function displayDataList(data){
   let htmlContent = '<ul class="list-group list-group-flush" style="width:95%;background-color:#202020">'
   data.forEach(function(item, index){
     const {id,avatar,gender,name,surname,region} = item
     htmlContent += `
           <li class="list-group-item list-group-item-action rounded d-flex justify-content-between align-items-center mx-3 mb-2 pl-5">
           <div class="zooming" >
              <img class="list-avatar card-image" data-id="${id}" data-toggle="modal" data-target="#show-user-modal" src="${avatar}" style="border-radius: 5%">
           </div>
           <div class="list-name">
             <h5><i class="fa fa-${gender}"></i> ${name}${surname}</h5>
             <i class="fa fa-home" style="color: gray"></i> ${region}
          </div>
          <div class="list-favorite"><i class="fa fa-heart-o btn btn-favorite" id="favorite" style="font-size:25px"  data-id="${item.id}"></i></div>
          </li>
`
   })
   htmlContent += `</ul>`
   dataPanel.innerHTML = htmlContent
 }
 
  //show user dedails modal
 function showUserInfo(id){
   //get elements
   const modalName = document.getElementById('show-user-name')
   const modalImage = document.getElementById('show-user-image')
   const modalDetails = document.getElementById('show-user-details')
   const modalUpdate = document.getElementById('user-update')
   //empty modal
   modalName.innerHTML = ''
   modalImage.innerHTML = ''
   modalDetails.innerHTML = ''
   modalUpdate.innerHTML = ''
   
   //set request url
   let url = INDEX_URL + "/" + id
   //console.log(url)
   
   //send request to show api
   axios.get(url).then((response) => {
     let data = response.data
     
      //insert data into modal ui
     modalName.textContent = `${data.name} ${data.surname}`
     modalImage.innerHTML = `<img src="${data.avatar}" class="img-fluid" alt="Responsive image">`
     modalDetails.innerHTML =`
             <p id="show-user-age">Age: ${data.age}</p>
             <p id="show-user-region">Region: ${data.region}</p>
             <p id="show-user-birthday"><i class="fa fa-birthday-cake"></i>  ${data.birthday}</p>
             <p id="show-user-email"><i class="fa fa-envelope"></i> ${data.email}</p>
          
`
     modalUpdate.innerHTML = `
       <p id="show-user-update"><small class="text-muted">Created at: ${data.created_at}<br>Updated at: ${data.updated_at}</small></p>
`
   })
 }
 
 function getTotalPages(data){
   let totalPages = Math.ceil(data.length / itemPerPage) || 1
   let pageItemContent = ''
   for (let i = 0; i < totalPages; i++){
     pageItemContent += `
       <li class="page-item">
         <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
      </li>`
   }
   pagination.innerHTML = pageItemContent
   showNowPageActive(1);
 }
 
 function getPageData(pageNum, data){
   paginationData = data || paginationData
   let offset = (pageNum - 1) * itemPerPage
   let pageData = paginationData.slice(offset, offset + itemPerPage)
   if (cardMode === true){
      displayDataCard(pageData)
       } else {
         displayDataList(pageData)
       }
   showFavoriteIcon()
 }
  
  //showing now page
 function showNowPageActive(pageNow) {
    for (let elm of pagination.children) {
        elm.classList.remove("active");
      if (elm.firstElementChild.dataset.page === pageNow.toString()) {
        elm.classList.add("active");
      }
    }
 }

 function addFavoriteUser (id){
  const user = data.find(item => item.id === Number(id))
  if (favoriteUser.some(item => item.id === Number(id))) {
  } else {
    favoriteUser.push(user)
  }
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUser))
 }
 
function removeFavoriteUser (id) {
    // find user by id
    const index = favoriteUser.findIndex(item => item.id === Number(id))
    if (index === -1) return

    // remove user and update localStorage
    favoriteUser.splice(index, 1)
    localStorage.setItem('favoriteUsers', JSON.stringify(favoriteUser))
  }
  
  //filling favorite user's heart icon
 function showFavoriteIcon() {
    const favoriteIcon = document.querySelectorAll('.btn-favorite')
    favoriteIcon.forEach(item => {
      if (favoriteUser.some(profile => profile.id === Number(item.dataset.id))) {
        item.classList = 'fa fa-heart btn btn-favorite'
      } 
    })
  } 
})()
