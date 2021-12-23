/*
- User

- Contacts

- ContactsApp
*/

class User {
    constructor(data) {
        this.data = {
            id: data.id || 0,
            name: data.name || null,
            email: data.email || null,
            address: data.address || null,
            phone: data.phone || null
        };
    }

    edit(newData) {
        for(let key in newData) if (this.data[key] && newData[key]) this.data[key] = newData[key];
        // this.data = Object.assign(this.data, newData);
    }

    get() {
        return this.data;
    }
}

class Contacts {
    constructor() {
        this.data = [];
    }

    add(data) {
        if (!data.name && !data.phone) return;

        let id = 0;

        this.data.forEach((contact) => {
            if (contact.data.id > id) id = contact.data.id;
        });

        id++;
        data.id = id;

        const user = new User(data);
        this.data.push(user);
    }

    edit(id, newdata) {
        if (!id) return;
        if (!newdata.name && !newdata.phone && !newdata.address && !newdata.email) return;

        const contact = this.data.find(contact => {
            return contact.data.id == id;
        });

        contact.edit(newdata);
    }

    remove(id) {
        if(!id) return;

            // let index = null;

            // this.data.forEach((contact, contactIndex) => {
            //     if (contact.data.id == id) index = contactIndex;
            // });

            // if (index === null) return;

            // this.data.splice(index, 1);

            this.data = this.data.filter(contact => {
                return contact.data.id != id;
            });
    }

    get() {
        return this.data;
    }
}

class ContactsApp extends Contacts {
    constructor() {
        super();

        if (!this.storage) {
            this.getData()
            .then(data => {
                this.storage = data;

                this.init();
            }); 
        } else {
            this.init();
        }       
    }

    init() {
        const contactsElem = document.createElement('div');
        contactsElem.classList.add('contacts');

        const formElem = document.createElement('div')
        formElem.classList.add('contacts__form');

        this.inputName = document.createElement('input');
        this.inputName.setAttribute('type', 'text');
        this.inputName.setAttribute('name', 'name');
        this.inputName.setAttribute('placeholder', 'Name');

        this.inputEmail = document.createElement('input');
        this.inputEmail.setAttribute('type', 'text');
        this.inputEmail.setAttribute('name', 'email');
        this.inputEmail.setAttribute('placeholder', 'Email');

        this.inputAddress = document.createElement('input');
        this.inputAddress.setAttribute('type', 'text');
        this.inputAddress.setAttribute('name', 'address');
        this.inputAddress.setAttribute('placeholder', 'Address');

        this.inputPhone = document.createElement('input');
        this.inputPhone.setAttribute('type', 'text');
        this.inputPhone.setAttribute('name', 'address');
        this.inputPhone.setAttribute('placeholder', 'Phone');

        this.listElem = document.createElement('ul');
        this.listElem.classList.add('contacts__list');


        formElem.append(this.inputName, this.inputEmail, this.inputAddress, this.inputPhone);
        contactsElem.append(formElem, this.listElem);
        document.body.append(contactsElem);

        formElem.addEventListener('keyup', event => {
            this.onAdd(event);
        });
        
        const data = this.storage;

        if (data && data.length > 0) {
            this.data = data;
            this.updateList();
        }
    }

    async getData() {
        return await fetch('https://jsonplaceholder.typicode.com/users')
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.map(post => {
                return {
                    data: {
                        id: post.id,
                        name: post.name,
                        email: post.email,
                        address: post.address,
                        phone: post.phone
                    }
                };
            });
            
            return data;
        });
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    setCookie(name, value, options = {}) {

        options = {
          path: '/',
          ...options
        };
      
        if (options.expires instanceof Date) {
          options.expires = options.expires.toUTCString();
        }
      
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      
        for (let optionKey in options) {
          updatedCookie += "; " + optionKey;
          let optionValue = options[optionKey];
          if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
          }
        }
      
        document.cookie = updatedCookie;
      }

    set storage(data) {
        localStorage.setItem('contacts', JSON.stringify(data));
        this.setCookie('contactsExp', '1', {'max-age': 5})
    }

    get storage() {
        const contactsExp = this.getCookie('contactsExp');
        if (!contactsExp) localStorage.removeItem('contacts');

        let data = localStorage.getItem('contacts');
        
        if (data && data.length == 0) return;

        data = JSON.parse(data);

        if (!data || data.length == 0) return;

        data = data.map(contact => {
            contact = new User(contact.data);
            return contact;
        });
        
        return data;
    }

    updateList() {
        this.listElem.innerHTML = '';

        const data = this.get();

        data.forEach(contact => {
            const li = document.createElement('li');
            li.classList.add('contact');

            const contactName = document.createElement('div');
            contactName.classList.add('contact__name');

            const contactEmail = document.createElement('div');
            contactEmail.classList.add('contact__email');
            
            const contactAddress = document.createElement('div');
            contactAddress.classList.add('contact__address');
            
            const contactPhone = document.createElement('div');
            contactPhone.classList.add('contact__phone');

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('contact__remove');
            removeBtn.innerHTML = 'X';

            if (contact.data.name) contactName.innerHTML = contact.data.name;
            if (contact.data.address) contactAddress.innerHTML = contact.data.address;
            if (contact.data.phone) contactPhone.innerHTML = contact.data.phone;
            if (contact.data.email) contactEmail.innerHTML = contact.data.email;

            li.append(contactName, contactEmail, contactAddress, contactPhone, removeBtn);
            this.listElem.append(li);

            removeBtn.addEventListener('click', event => {
                this.onRemove(event, contact.data.id);
            });

            contactName.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactEmail.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });
            
            contactAddress.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactPhone.addEventListener('dblclick', event => {
                event.target.setAttribute('contenteditable', true);
                event.target.focus();
            });

            contactName.addEventListener('keyup', event => {
                this.onSave(event, contact.data.id, 'name');
            });

            contactEmail.addEventListener('keyup', event => {
                this.onSave(event, contact.data.id, 'email');
            });

            contactAddress.addEventListener('keyup', event => {
                this.onSave(event, contact.data.id, 'address');
            });

            contactPhone.addEventListener('keyup', event => {
                this.onSave(event, contact.data.id, 'phone');
            });
        });

        this.storage = data;
    }

    onAdd(event) {
        if (event.code != 'Enter' || !event.ctrlKey) return;

        const inputElemName = this.inputName.value;
        const inputElemEmail = this.inputEmail.value;
        const inputElemAddress = this.inputAddress.value;
        const inputElemPhone = this.inputPhone.value;

        const data = {
            name: 'Name: ' + inputElemName || null,
            address: 'Address: ' + inputElemAddress || null,
            phone: 'Phone: ' + inputElemPhone || null,
            email: 'Email: ' + inputElemEmail || null
        };

        this.inputName.value = '';
        this.inputAddress.value = '';
        this.inputEmail.value = '';
        this.inputPhone.value = '';
        
        this.add(data);
        this.updateList();
    }

    onSave(event, id, key) {
        if (event.code != 'Enter' || !event.ctrlKey) return;

        const data = {};
        data[key] = event.target.textContent;

        this.edit(id, data);
        this.updateList();

        event.target.setAttribute('contenteditable', false);
    }

    onRemove(event, id) {
        this.remove(id);
        this.updateList();
    }
}

new ContactsApp();