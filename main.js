var config = {
    apiKey: "AIzaSyAPGzVCjpt0Fmaduy5e6KduX3MWCmqgRzI",
    authDomain: "it354final.firebaseapp.com",
    databaseURL: "https://it354final.firebaseio.com",
    projectId: "it354final",
    storageBucket: "it354final.appspot.com",
    messagingSenderId: "517777989236"
};
firebase.initializeApp(config);

//SIGN UP
Vue.component('sign-up-page', {
    data: function () {
        return {
            first: '',
            last: '',
            email: '',
            password: '',
            confirm: ''
        }
    },
    methods: {
        signUp() {
            if (this.email === '') {
                vm.error = 'Must include email'
                return
            }
            if (this.first === '') {
                vm.error = 'Must include first name'
                return
            }
            if (this.last === '') {
                vm.error = 'Must include last name'
                return
            }
            if (this.password === '') {
                vm.error = 'Must include password'
                return
            }
            if (this.password !== this.confirm) {
                vm.error = 'Passwords must match'
                return
            }
            vm.signUpUser(this.first, this.last, this.email, this.password)
        }
    },
    mounted: function () {
        console.log('signup mounted')
    }
})


//SIGN IN
Vue.component('sign-in-page', {
    data: function () {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        signIn: function () {
            if (this.email === '') {
                vm.error = 'Must include an email'
                return
            }
            if (this.password === '') {
                vm.error = 'Must include password'
                return
            }
            vm.signInUser(this.email, this.password)
        }
    },
    mounted: function () {
        console.log('signin mounted')
    }
})

//CREATE LIST
Vue.component('create-list-page', {
    data: function () {
        return {
            name: '',
            priority: 'false'
        }
    },
    methods: {
        create: function () {
            vm.createList(this.name, (this.priority === 'true') ? true : false)
        }
    },
    mounted: function () {
        console.log('create mounted')
    }
})

//VIEW LIST
Vue.component('view-list-page', {
    data: function () {
        return {
            name: '',
            priority: 0
        }
    },
    methods: {
        add: function () {
            console.log(this.priority)
            if (this.priority == '' || this.priority < 0 || this.priority > 10) this.priority = 0
            vm.addToCurrentList(this.name, this.priority)
            this.name = ''
        },
    },
    computed: {
        listName: function () {
            if (vm.currentList == null || vm.currentList === '') return 'N/A'
            return vm.currentList.name
        },
        listCreator: function () {
            if (vm.currentList.user == null) {
                return 'you'
            }
            return vm.currentList.user.first
        },
        orderedItems: function () {
            if (vm.currentList.priority === true) {
                vm.currentList.items.sort(function (a, b) {
                    return b.priority - a.priority
                })
            }
            return vm.currentList.items
        }
    },
    mounted: function () {
        console.log('list mounted')
        if (vm.currentList === '') {
            vm.keep = true
            vm.error = 'must select a list'
            vm.page = 'default'
            return
        }
        vm.completeCurrentList()
        this.name = ''
    }
})

//SEND INVITE
Vue.component('send-invite-page', {
    data: function () {
        return {
            email: ''
        }
    },
    methods: {
        send: function() {
            vm.sendInvite(this.email, this.listName)
        }
    },
    computed: {
        listName: function () {
            if (vm.currentList == null || vm.currentList === '') return 'N/A'
            return vm.currentList.name
        }
    },
    mounted: function () {
        console.log('send invite mounted')
        if (vm.currentList === '') {
            vm.keep = true
            vm.error = 'must select a list'
            vm.page = 'default'
            return
        }
        if (vm.currentList.user !== null) {
            vm.keep = true
            vm.error = 'can only send invites to your lists'
            vm.page = 'default'
            return
        }
    }
})

//VIEW INVITES
Vue.component('view-invites-page', {
    data: function () {
        return {}
    },
    mounted: function () {
        console.log('invites mounted')
    }
})

//MAIN MENU
Vue.component('main-menu-page', {
    data: function () {
        return {}
    },
    methods: {
        goToCreate: function () {
            vm.page = 'create'
        },
        goToList: function () {
            vm.page = 'list'
        },
        goToSendInvite: function () {
            vm.page = 'sendInvite'
        },
        goToInvites: function () {
            vm.page = 'invites'
        }
    },
    computed: {
        invitesSize: function () {
            if (vm.invites == null) return 0
            return vm.invites.length
        }
    },
    mounted: function () {
        console.log('main menu mounted')
        vm.updateState()
        vm.currentList = ''
    }
})

//VUE INSTANCE
var vm = new Vue({
    el: '#app',
    data: {
        lastID: 0,
        keep: false,
        page: 'default',
        auth: false,
        error: '',
        message: '',
        first: '',
        last: '',
        currentList: '',
        lists: [],
        sharedLists: [],
        invites: []
    },
    methods: {
        signInUser: function (email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function () {

                    console.log('sign in success! ' + firebase.auth().currentUser.email)
                })
                .catch(function (error) {
                    vm.error = error.message
                })
        },
        signUpUser: function (first, last, email, password) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(function () {
                    var path = 'users/' + emailToKey(email)
                    firebase.database().ref(path).set({
                        name: {
                            first: first,
                            last: last
                        },
                        email: email
                    })
                    vm.first = first
                    vm.last = last
                    console.log('sign up success! ' + firebase.auth().currentUser.email)
                }).catch(function (error) {
                    vm.error = error.message
                })
        },
        signOutUser: function () {
            firebase.auth().signOut()
        },
        updateState: function () {
            this.setLists()
            this.setShared()
            this.setInvites()
        },
        createList: function (name, priority) {
            var path = 'users/' + emailToKey(this.getEmail()) + '/lists/' + name

            firebase.database().ref(path).once('value').then(function (snapshot) {
                if (snapshot.val() != null) {
                    vm.error = 'list already exists'
                    return
                }
                firebase.database().ref(path).set({
                        items: 'empty',
                        priority: priority
                    })
                    .then(function () {
                        vm.page = 'default'
                    })
                    .catch(function () {
                        vm.error = 'list could not be created'
                    })
            })
        },
        setName: function () {
            var path = 'users/' + emailToKey(vm.getEmail()) + '/name'
            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.first = snapshot.val().first
                vm.last = snapshot.val().last
            })
        },
        setLists: function () {
            var path = 'users/' + emailToKey(this.getEmail()) + '/lists'
            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.lists = []
                var lists = snapshot.val()
                if (!lists) return
                var names = Object.keys(lists)
                for (var name in lists) {
                    vm.lists.push(new List(null, name, null))
                }
            }).catch(function () {
                console.log('error: could not get lists')
            })
        },
        setShared: function () {

        },
        setInvites: function () {

        },
        getEmail: function () {
            var current = firebase.auth().currentUser
            if (current === null) return null
            return current.email
        },
        completeCurrentList: function () {
            if (this.currentList === '' || this.currentList == null) {
                console.log('error: cannot complete invalid current list')
                return
            }
            var path = 'users/'
            if (this.currentList.user == null) {
                path += emailToKey(this.getEmail())
            } else {
                path += emailToKey(this.currentList.user.email)
            }
            path += '/lists/' + this.currentList.name
            firebase.database().ref(path).once('value').then(function (snapshot) {
                var items = snapshot.val().items
                if (items === 'empty' || items == null) {
                    vm.currentList.items = []
                } else {
                    vm.currentList.items = items
                }
                vm.currentList.priority = snapshot.val().priority
                console.log('priority: ' + snapshot.val().priority)
            }).catch(function () {
                console.log('error: could not find currentList')
            })
        },
        addToCurrentList: function (name, priority) {
            var path = 'users/'
            if (this.currentList.user == null) {
                path += emailToKey(this.getEmail())
            } else {
                path += emailToKey(this.currentList.user.email)
            }
            path += '/lists/' + this.currentList.name
            var newItem = new ListItem(new User(vm.getEmail(), vm.first), name, priority)
            firebase.database().ref(path).once('value').then(function (snapshot) {
                var items = snapshot.val().items
                if (items === 'empty' || items === null) {
                    vm.currentList.items = [newItem]
                    firebase.database().ref(path).update({
                        items: [newItem]
                    })
                } else {
                    console.log(items)
                    vm.currentList.items = items
                    vm.currentList.items.push(newItem)
                    firebase.database().ref(path + '/items').set(vm.currentList.items)
                }
            })
        },
        sendInvite: function(name, email) {
            console.log(name + email)
        }
    },
    computed: {
        listOptions: function () {
            return this.lists
        },
        pageName: function () {
            if (this.page === 'signup') return 'Sign up'
            if (this.page === 'create') return 'Create List'
            if (this.page === 'list') return 'List'
            if (this.page === 'invites') return 'Invites'
            return 'Main'
        }
    },
    watch: {
        page: function () {
            if (this.keep === true) {
                this.keep = false
            } else {
                this.error = ''
            }
            this.message = ''
        }
    },
    created: function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                vm.auth = true
                vm.setName()
            } else {
                vm.auth = false
            }
            vm.page = 'default'
        })
    }
})

function List(user, name, items, priority) {
    this.user = user
    this.name = name
    this.items = items
    this.priority = priority
}

function ListItem(user, name, priority) {
    this.user = user
    this.name = name
    this.priority = priority
}

function User(email, first) {
    this.email = email
    this.first = first
}

function Invite(userFrom, listName) {
    this.userFrom = userFrom
    this.listName = listName
}

function emailToKey(email) {
    return email.replace(/[.]/g, '%20');
}

function keyToEmail(key) {
    return key.replace(/(%20)/g, '.');
}