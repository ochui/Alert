/**
 * FirebaseUI initialization to be used in a Single Page application context.
 */

/**
 * @return {!Object} The FirebaseUI config.
 */
function getUiConfig() {
    return {
        'callbacks': {
            // Called when the user has been successfully signed in.
            'signInSuccessWithAuthResult': function(authResult, redirectUrl) {
                console.log(authResult)
                if (authResult.user) {
                    handleSignedInUser(authResult.user);
                }
                if (authResult.additionalUserInfo.isNewUser && window.location.pathname == '/cop.html') {
                    axios.post(`/cops/create`, {
                        userId: authResult.user.uid,
                        displayName: authResult.user.displayName,
                        email: authResult.user.email,
                        approved: false,
                        location: {
                            type: "Point",
                            address: "",
                            coordinates: [
                                77.63997110000003,
                                13.0280047
                            ]
                        }
                    }).then((response) => {
                        console.log(response)
                    })
                    window.location.href = 'not-approved.html'
                }
                return false;
            }
        },
        // Opens IDP Providers sign-in flow in a popup.
        'signInFlow': 'popup',
        'signInOptions': [
            // TODO(developer): Remove the providers you don't need for your app.
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                // Required to enable this provider in One-Tap Sign-up.
                authMethod: 'https://accounts.google.com',
                // Required to enable ID token credentials for this provider.
                clientId: "{{CLIENT_ID}}"
            },
            // {
            //     provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            //     /civilian.html
            //         'public_profile',
            //         'email',
            //         'user_likes',
            //         'user_friends'
            //     ]
            // },
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                // Whether the display name should be displayed in Sign Up page.
                requireDisplayName: true,
                signInMethod: getEmailSignInMethod()
            },
            {
                provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                recaptchaParameters: {
                    size: getRecaptchaMode()
                },
                whitelistedCountries: ['NG', '+234']
            },
            // {
            //     provider: 'microsoft.com',
            //     loginHintKey: 'login_hint'
            // },
            // {
            //     provider: 'apple.com',
            // },
            // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        'tosUrl': 'https://www.google.com',
        // Privacy policy url.
        'privacyPolicyUrl': 'https://www.google.com',
        // 'credentialHelper': CLIENT_ID && CLIENT_ID != 'YOUR_OAUTH_CLIENT_ID' ?
        //     firebaseui.auth.CredentialHelper.GOOGLE_YOLO : firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
    };
}

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Disable auto-sign in.
ui.disableAutoSignIn();


/**
 * @return {string} The URL of the FirebaseUI standalone widget.
 */
function getWidgetUrl() {
    return '/widget#recaptcha=' + getRecaptchaMode() + '&emailSignInMethod=' +
        getEmailSignInMethod();
}


/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function() {
    window.location.assign(getWidgetUrl());
};


/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function() {
    window.open(getWidgetUrl(), 'Sign In', 'width=985,height=735');
};


/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
    userId = user.uid;

    socket.emit("join", { userId: user.uid }); // Join a room, room-name is the userId itself!

    // document.body.getAttribute("data-userId") = user.uid;
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    document.getElementById('name').textContent = `Hello, ${user.displayName}`;
    // document.getElementById('email').textContent = user.email;
    // document.getElementById('phone').textContent = user.phoneNumber;
    // document.getElementById('user-id').textContent = user.uid;
    document.body.setAttribute('data-userId', user.uid)
        // if (user.photoURL) {
        //     var photoURL = user.photoURL;
        //     // Append size to the photo URL for Google hosted images to avoid requesting
        //     // the image with its original resolution (using more bandwidth than needed)
        //     // when it is going to be presented in smaller size.
        //     if ((photoURL.indexOf('googleusercontent.com') != -1) ||
        //         (photoURL.indexOf('ggpht.com') != -1)) {
        //         photoURL = photoURL + '?sz=' +
        //             document.getElementById('photo').clientHeight;
        //     }
        //     document.getElementById('photo').src = photoURL;
        //     document.getElementById('photo').style.display = 'block';
        // } else {
        //     document.getElementById('photo').style.display = 'none';
        // }

    // if (pathname == '/civilian.html') {
    //     // redirect the user

    //     window.location.href = buildUrl(pathname + '?userId=' + user.displayName.replace(/\s+/g, ''))
    // }

};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    document.body.setAttribute('data-userId', null)
    userId = null;
    ui.start('#firebaseui-container', getUiConfig());
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {

    document.getElementById('loading').style.display = 'none';
    document.getElementById('loaded').style.display = 'block';
    user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
    firebase.auth().currentUser.delete().catch(function(error) {
        if (error.code == 'auth/requires-recent-login') {
            // The user's credential is too old. She needs to sign in again.
            firebase.auth().signOut().then(function() {
                // The timeout allows the message to be displayed after the UI has
                // changed to the signed out state.
                setTimeout(function() {
                    alert('Please sign in again to delete your account.');
                }, 1);
            });
        }
    });
};


/**
 * Initializes the app.
 */
var initApp = function() {

    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
    // document.getElementById('delete-account').addEventListener(
    //     'click',
    //     function() {
    //         deleteAccount();
    //     });
};

window.addEventListener('load', initApp);