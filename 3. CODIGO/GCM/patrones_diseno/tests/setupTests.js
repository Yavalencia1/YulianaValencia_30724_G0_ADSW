// LocalStorage

const storage = {};

Object.defineProperty(window, "localStorage", {

    value: {

        getItem: jest.fn(key => storage[key]),

        setItem: jest.fn((key, value) => {

            storage[key] = value;

        }),

        removeItem: jest.fn(key => {

            delete storage[key];

        }),

        clear: jest.fn(() => {

            Object.keys(storage).forEach(k => delete storage[k]);

        })

    }

});


// Mock de XMLHttpRequest

global.XMLHttpRequest = jest.fn(() => ({

    open: jest.fn(),

    send: jest.fn(),

    setRequestHeader: jest.fn(),

    status: 200,

    responseText: JSON.stringify({

        ok: true,

        data: {}

    })

}));


// Mock EmailJS

global.emailjs = {

    send: jest.fn(() => Promise.resolve())

};


// Mock console

console.error = jest.fn();

console.log = jest.fn();