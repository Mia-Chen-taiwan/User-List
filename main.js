(function () {
  // new variable
  const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
  const INDEX_URL = BASE_URL + '/api/v1/users'
  const data = [] //用來存放 Index API 回傳的 JSON 資料。
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('searchForm')
  const searchInput = document.getElementById('search-friend')
  const home =  document.getElementById('home')
  const userModal =  document.getElementById('show-user-modal')
  const pagination = document.getElementById('pagination')
  let itemPerPage = 20
  let paginationData = []
  let pageNow = 1

  axios.get(INDEX_URL).then((response)=>{
    //測試從哪抓出資料
    //console.log(response.data)
    //console.log(...response.data.results)
    data.push(...response.data.results)  
    getTotalPages(data)
    getPageData(1, data)
  })
 
 //listen to dataPanel
 dataPanel.addEventListener('click', event => {
   let id = event.target.dataset.id
   if (event.target.matches('.card-image')){
     showUserInfo(id)
   }
   //add/cancel like
   if (event.target.matches('.fa-heart-o')){
     event.target.classList = 'fa fa-heart btn btn-favorite'
   } else if (event.target.matches('.fa-heart')){
     event.target.classList = 'fa fa-heart-o btn btn-favorite'
   }
 })

 //listen to search bar
 searchForm.addEventListener('submit', event => {
   event.preventDefault()
   let result = []
   const regex = new RegExp(searchInput.value, 'i')
   result = data.filter(user => user.name.match(regex))
   //displayDataList(result)
    getTotalPages(result)
    getPageData(1, result)
   searchInput.value = ''
 })
 
 //back to home page
 home.addEventListener('click', e => {
    getTotalPages(data)
    getPageData(1, data)  
 
 })
 
 //listen to pagination
 pagination.addEventListener('click', event => {
   pageNow = event.target.dataset.page
   console.log(pageNow)
   if (event.target.tagName === 'A') {
     getPageData(pageNow)
   }
 })
 
 function displayDataList(data){
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
 
 function showUserInfo(id){
   //get elements
   const modalName = document.getElementById('show-user-name')
   const modalImage = document.getElementById('show-user-image')
   const modalAge = document.getElementById('show-user-age')
   const modalRegion = document.getElementById('show-user-region')
   const modalBirthday = document.getElementById('show-user-birthday')
   const modalEmail = document.getElementById('show-user-email')
   const modalLastUpdated = document.getElementById('show-user-lastUpdated')
   const modalCreated= document.getElementById('show-user-created')
   
   //set request url
   let url = INDEX_URL + "/" + id
   //console.log(url)
   
   //send request to show api
   axios.get(url).then((response) => {
     let data = response.data
     
      //insert data into modal ui
     modalName.textContent = data.name
     modalImage.innerHTML = `<img src="${data.avatar}" class="img-fluid" alt="Responsive image">`
     modalAge.textContent = `Age: ${data.age}`
     modalRegion.textContent = `Region: ${data.region}`
     modalBirthday.innerHTML =`<i class="fa fa-birthday-cake"></i>  ${data.birthday}` 
     modalEmail.innerHTML = `<i class="fa fa-envelope"></i> ${data.email}`
     modalCreated.innerHTML = `<small class="text-muted">Created at: ${data.created_at}</small>`
     modalLastUpdated.innerHTML = `<small class="text-muted">Updated at: ${data.updated_at}</small>`
   })
 }
 
 function getTotalPages(data){
   let totalPages = Math.ceil(data.length / itemPerPage) || 1
   let pageItemContent = `
     <li class="page-item">
       <a class="page-link" href="#" aria-label="Previous">
         <span aria-hidden="true">&laquo;</span>
         <span class="sr-only">Previous</span>
       </a>
   </li>`
   for (let i = 0; i < totalPages; i++){
     pageItemContent += `
       <li class="page-item">
         <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
      </li>`
   }
   pageItemContent +=`
     <li>
       <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
        <span class="sr-only">Next</span>
     </a>
   </li>`
   pagination.innerHTML = pageItemContent
 }
 
 function getPageData(pageNum, data){
   paginationData = data || paginationData
   let offset = (pageNum - 1) * itemPerPage
   let pageData = paginationData.slice(offset, offset + itemPerPage)
   displayDataList(pageData)
 }
 
})()