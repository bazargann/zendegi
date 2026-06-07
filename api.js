const userList = document.getElementById('userList');
const UserNameLastNameTable = document.getElementById('UserNameLastNameTable')
const selectCountry = document.getElementById('selectCountry')

const xhr = new XMLHttpRequest();

xhr.open('GET', './api/users.json');

xhr.onload = function() {

console.log(xhr);

    if(xhr.readyState == 4 && xhr.status == 200){
        let user = JSON.parse(xhr.responseText);
        console.log(user);
           user.forEach(element => {
            userList.innerHTML += `

            <p> username:${element.username}</p>
            <p> password:${element.password}</p> `;

            UserNameLastNameTable.innerHTML +=`
            
            <tr>
            <td>${element.name.firstname}</td>
            <td>${element.name.lastname}</td>
            </tr>`
        });
    }

}

const selectCity = (e) =>{
    e.value;
}


xhr.open('GET', './api/capital.json');
xhr.onload = function() {

    let city = JSON.parse(xhr.responseText);
    
    let Data = city.data;

    console.log(Data);
    
    Data.forEach(element =>{
        console.log(element.name);
        let val = element.name;
        selectCountry.innerHTML +=`
        <option value='${val}'> ${element.name} </option>`



    })

}

xhr.send();


