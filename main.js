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
        return {}
    },
    mounted: function () {
        console.log('create mounted')
    }
})

//VIEW LIST
Vue.component('view-list-page', {
    data: function () {
        return {}
    },
    mounted: function () {
        console.log('list mounted')
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
    mounted: function () {
        console.log('main menu mounted')
    }
})

//VUE INSTANCE
var vm = new Vue({
    el: '#app',
    data: {
        page: 'default',
        auth: false,
        error: ''
    },
    methods: {
        signInUser: function (email, password) {
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(function() {
                    console.log('sign in success!')
                })
                .catch(function (error) {
                    vm.error = error.message
                })
        },
        signUpUser: function (first, last, email, password) {
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function() {
                console.log('sign up success! ' + first + ' ' + last)
            }).catch(function(error) {
                vm.error = error.message
            })
        },
        signOutUser: function () {
            firebase.auth().signOut()
        }
    },
    computed: {
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
            this.error = ''
        }
    },
    created: function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                vm.auth = true
                vm.email = user.email
            } else {
                vm.auth = false
                vm.email = null
            }
            vm.page = 'default'
        })
    }
})