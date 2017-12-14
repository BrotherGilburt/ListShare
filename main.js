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

    }
})

//CREATE LIST
Vue.component('create-list-page', {
    data: function () {
        return {
            name: '',
            priority: 'false',
            copy: ''
        }
    },
    methods: {
        create: function () {
            if (this.copy === '') {
                vm.createList(this.name, (this.priority === 'true') ? true : false)
            } else {
                vm.copyList(this.name, (this.priority === 'true') ? true : false, this.copy)
            }
        }
    },
    computed: {
        isShared: function () {
            if (vm.sharedLists.length === 0) return false
            return true
        }
    },
    mounted: function () {
        vm.updateState
    }
})

//VIEW LIST
Vue.component('view-list-page', {
    data: function () {
        return {
            name: '',
            priority: 0,
            row: true
        }
    },
    methods: {
        add: function () {
            if (this.name === '') {
                vm.error = 'an item name is required'
                return
            }
            if (this.priority == '') this.priority = 0
            if (this.priority < 0 || this.priority > 10 || !Number.isInteger(this.priority)) {
                vm.error = 'priority must be an integer 0-10'
                return
            }
            vm.addToCurrentList(this.name, this.priority)
            this.name = ''
        }
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
        },
        noItems: function() {
            if (vm.currentList.items == null) return false
            return vm.currentList.items.length == 0
        }
    },
    mounted: function () {
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
        send: function () {
            if (this.email === '') {
                vm.error = 'email is required'
                return
            }
            if (this.email === vm.getEmail()) {
                vm.error = 'cannot invite yourself'
                return
            }
            vm.error = ''
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
        vm.message = ''
    }
})

//VIEW INVITES
Vue.component('view-invites-page', {
    data: function () {
        return {}
    },
    methods: {
        accept: function (invite) {
            vm.acceptInvite(invite)
        },
        decline: function (invite) {
            vm.removeInvite(invite)
        }
    },
    computed: {
        invitesDisplay: function () {
            return vm.invites
        },
        isInvites: function () {
            return !(vm.invites.length == 0)
        }
    },
    mounted: function () {
        vm.setInvites()
        vm.message = ''
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
        },
        isShared: function () {
            if (vm.sharedLists.length === 0) return false
            return true
        }
    },
    mounted: function () {
        vm.updateState()
        vm.currentList = ''
    }
})

//VUE INSTANCE
var vm = new Vue({
    el: '#app',
    data: {
        currentKey: 0,
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
        getKey: function () {
            var key = this.currentKey
            this.currentKey += 1
            return key
        },
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
                    var path = 'users/' + stringToKey(email)
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
        createList: function (name, priority, listItems) {
            if (name.indexOf('"') > -1) {
                vm.error = 'quotation marks not allowed'
                return
            }
            if (listItems == null || listItems == undefined) listItems = 'empty'
            if (name === '') name = vm.formattedDate()

            var path = 'users/' + stringToKey(this.getEmail()) + '/lists/' + stringToKey(name)

            firebase.database().ref(path).once('value').then(function (snapshot) {
                if (snapshot.val() != null) {
                    vm.error = 'list already exists'
                    return
                }
                firebase.database().ref(path).set({
                        name: name,
                        items: listItems,
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
        copyList: function (name, priority, copy) {
            var path = 'users/'
            if (copy.user == null) {
                path += stringToKey(this.getEmail())
            } else {
                path += stringToKey(copy.user.email)
            }
            path += '/lists/' + stringToKey(copy.name)
            firebase.database().ref(path).once('value').then(function (snapshot) {
                var items = snapshot.val().items
                vm.createList(name, priority, items)
            }).catch(function () {
                console.log('error: could not find copylist')
            })
        },
        setName: function () {
            var path = 'users/' + stringToKey(vm.getEmail()) + '/name'
            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.first = snapshot.val().first
                vm.last = snapshot.val().last
            })
        },
        setLists: function () {
            var path = 'users/' + stringToKey(this.getEmail()) + '/lists'
            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.lists = []
                var lists = snapshot.val()
                if (!lists) return
                for (var list in lists) {
                    var current = lists[list]
                    vm.lists.push(new List(null, current.name, null))
                }
            }).catch(function () {
                console.log('error: could not get lists')
            })
        },
        setShared: function () {
            var path = 'users/' + stringToKey(this.getEmail()) + '/shared'

            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.sharedLists = []
                var sources = snapshot.val()
                if (sources == null) return
                for (email in sources) {
                    var source = sources[email]
                    for (listName in source) {
                        var list = source[listName]
                        var user = new User(list.email, list.first)
                        vm.sharedLists.push(new List(user, list.name, null, null))
                    }
                }
            })
        },
        setInvites: function () {
            var path = 'users/' + stringToKey(this.getEmail()) + '/invites'

            firebase.database().ref(path).once('value').then(function (snapshot) {
                vm.invites = []
                var sources = snapshot.val()
                if (sources == null) return
                for (var email in sources) {
                    var source = sources[email]
                    for (list in source) {
                        var invite = source[list]
                        var user = new User(invite.email, invite.first)
                        vm.invites.push(new Invite(user, invite.name))
                    }
                }
            })
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
                path += stringToKey(this.getEmail())
            } else {
                path += stringToKey(this.currentList.user.email)
            }
            path += '/lists/' + stringToKey(this.currentList.name)
            firebase.database().ref(path).once('value').then(function (snapshot) {
                var items = snapshot.val().items
                if (items === 'empty' || items == null) {
                    vm.currentList.items = []
                } else {
                    vm.currentList.items = items
                }
                vm.currentList.priority = snapshot.val().priority
            }).catch(function () {
                console.log('error: could not find currentList')
            })
        },
        addToCurrentList: function (name, priority) {            
            var path = 'users/'
            if (this.currentList.user == null) {
                path += stringToKey(this.getEmail())
            } else {
                path += stringToKey(this.currentList.user.email)
            }
            path += '/lists/' + stringToKey(this.currentList.name)
            var newItem = new ListItem(new User(vm.getEmail(), vm.first), name, priority)
            firebase.database().ref(path).once('value').then(function (snapshot) {
                var items = snapshot.val().items
                if (items === 'empty' || items == null) {
                    vm.currentList.items = [newItem]
                    firebase.database().ref(path).update({
                        items: vm.formatItems([newItem], true)
                    })
                } else {
                    delete newItem.key
                    delete newItem.user.key
                    items.push(newItem)
                    firebase.database().ref(path + '/items').set(items)
                    vm.currentList.items = vm.formatItems(items, false)
                }
                vm.error = ''
            }).catch(function() {
                cm.error = ''
            })
        },
        sendInvite: function (email, name) {
            var path = 'users/' + stringToKey(email)
            firebase.database().ref(path + '/name').once('value').then(function (snapshot) {
                if (snapshot.val() === null) {
                    vm.error = 'user not found'
                    return
                }
                firebase.database().ref(path + '/invites/' + stringToKey(vm.getEmail()) + '/' + stringToKey(name)).update({
                    first: vm.first,
                    email: vm.getEmail(),
                    name: name
                }).then(function () {
                    vm.message = 'invite sent!'
                }).catch(function () {
                    vm.error = 'invite could not be sent'
                })
            }).catch(function () {
                vm.error = 'user not found'
            })
        },
        acceptInvite: function (invite) {
            var path = 'users/' + stringToKey(this.getEmail()) + '/shared/' + stringToKey(invite.userFrom.email) + '/' + stringToKey(invite.listName)
            firebase.database().ref(path).update({
                first: invite.userFrom.first,
                email: invite.userFrom.email,
                name: invite.listName
            }).then(function () {
                vm.removeInvite(invite)
                vm.message = 'invite accepted'
                vm.error = ''
            }).catch(function () {
                vm.message = ''
                vm.error = 'invite could not be accepted'
            })
        },
        removeInvite: function (invite) {
            var path = 'users/' + stringToKey(this.getEmail()) + '/invites/' + stringToKey(invite.userFrom.email) + '/' + stringToKey(invite.listName)
            firebase.database().ref(path).remove().then(function () {
                vm.error = ''
                vm.setInvites()
            })
        },
        formatItems: function (items, db) {
            var formattedItems = []
            for (key in items) {
                var item = items[key]
                formattedItems.push(new ListItem(new User(item.user.email, item.user.first, db), item.name, item.priority, db))
            }
            return formattedItems
        },
        formattedDate: function () {
            var today = new Date()
            var dd = today.getDate()
            var mm = today.getMonth() + 1

            var yyyy = today.getFullYear()
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            return mm + '-' + dd + '-' + yyyy
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

function List(user, name, items, priority, db) {
    this.user = user
    this.name = name
    this.items = items
    if (priority !== true) {
        this.priority = false
    } else {
        this.priority = priority
    }
    if (db !== true) this.key = vm.getKey()
}

function ListItem(user, name, priority, db) {
    this.user = user
    this.name = name
    if (priority == null) {
        this.priority = 0
    } else {
        this.priority = priority
    }
    if (db !== true) this.key = vm.getKey()
}

function User(email, first, db) {
    this.email = email
    this.first = first
    if (db !== true) this.key = vm.getKey()
}

function Invite(userFrom, listName, db) {
    this.userFrom = userFrom
    this.listName = listName
    if (db !== true) this.key = vm.getKey()
}

function stringToKey(email) {
    var mod = email.replace(/[.]/g, '%20')
    return mod.replace(/[/]/g, '%21')
}