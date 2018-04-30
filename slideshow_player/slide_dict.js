// All sample slide here need to specify its own image.
// We have to set image field

exports.slideDict = slideDictionary = [
    {
        "duration": 20000,
        "kenburns": {
            "from": [0.5, [0.5, 0.6]],
            "to": [1, [0.5, 0.6]]
        },
        "transitionNext": {
            "name": "crosszoom",
            "duration": 4000
        }
  },
    {
        "duration": 16000,
        "kenburns": {
            "from": [0.9],
            "to": [0.7, [0.8, 0.6]]
        },
        "transitionNext": {
            "name": "linearblur",
            "duration": 4000
        }
  },
    {
        "duration": 20000,
        "kenburns": {
            "from": [0.7, [0, 0.5]],
            "to": [0.7, [1, 0.5]]
        },
        "transitionNext": {
            "name": "DoomScreenTransition",
            "duration": 8000
        }
  },
    {
        "duration": 24000,
        "kenburns": {
            "from": [0.3, [0.5, 0.8]],
            "to": [1]
        },
        "transitionNext": {
            "name": "doorway",
            "duration": 8000
        }
  },
    {
        "duration": 16000,
        "kenburns": {
            "from": [1],
            "to": [0.3]
        },
        "transitionNext": {
            "name": "heartwipe",
            "duration": 6000
        }
  },
    {
        "duration": 24000,
        "kenburns": {
            "from": [0.4, [1.0, 0.5]],
            "to": [1.0, [0.5, 0.5]],
            "easing": [0.3, 0, 1, 1]
        },
        "transitionNext": {
            "name": "pagecurl",
            "duration": 8000
        }
  },
    {
        duration: 24000,
        kenburns: {
            from: [0.8, [0.5, 0.5]],
            to: [1, [0.5, 0.5]]
        },
        transitionNext: {
            duration: 8000,
            name: "circleopen"
        }
    },
    {
        "kenburns": {
            "easing": [
          0.3161764705882353,
          0.007407407407407418,
          0.75,
          0.75
        ],
            "from": [
          0.880167474730694,
          [
            0.5754716981132075,
            0.31512605042016806
          ]
        ],
            "to": [
          1,
          [
            0.6344339622641509,
            0.23109243697478993
          ]
        ]
        },
        "duration": 24000,
        "transitionNext": {
            "name": "directionalwipe",
            "duration": 8000
        }
    },
    {
        "kenburns": {
            "easing": [
          0.25,
          0.25,
          0.5919117647058824,
          0.9925925925925926
        ],
            "from": [
          0.7895868757190729,
          [
            0.4080188679245283,
            0.4045936395759717
          ]
        ],
            "to": [
          1,
          [
            0.6698113207547169,
            0.6484098939929329
          ]
        ]
        },
        "duration": 24000,
        "transitionNext": {
            "uniforms": {
                "smoothness": 0.03
            },
            "name": "undulating burn out",
            "duration": 8000
        }
    },
    {
        "kenburns": {
            "from": [
          1,
          [
            0.5,
            0.5
          ]
        ],
            "to": [
          0.8911303463002942,
          [
            0.6957547169811321,
            0.5671378091872792
          ]
        ]
        },
        "duration": 24000,
        "transitionNext": {
            "name": "CrossZoom",
            "duration": 8000
        }
    },
    {
      "kenburns": {
        "from": [
          0.9306164923130157,
          [
            0.7004716981132075,
            0.5210084033613446
          ]
        ],
        "to": [
          1,
          [
            0.44339622641509435,
            0.5588235294117647
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "PageCurl",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "from": [
          1,
          [
            0.4787735849056604,
            0.5035335689045937
          ]
        ],
        "to": [
          0.8907929182125104,
          [
            0.6509433962264151,
            0.5070671378091873
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "AdvancedMosaic",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "easing": [
          0.5294117647058824,
          0.0037037037037036535,
          0.46691176470588236,
          0.9925925925925926
        ],
        "from": [
          1,
          [
            0.7169811320754718,
            0.5812720848056537
          ]
        ],
        "to": [
          0.75,
          [
            0.46933962264150947,
            0.5035335689045936
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "Glitch Memories",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "from": [
          1,
          [
            0.24764150943396224,
            0.5424028268551235
          ]
        ],
        "to": [
          0.7953900588013744,
          [
            0.6344339622641509,
            0.588339222614841
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "doorway",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "easing": [
          0.09926470588235294,
          0.0037037037037036535,
          0.8602941176470589,
          0.9888888888888889
        ],
        "from": [
          0.6468569960686288,
          [
            0.4858490566037736,
            0.25280898876404495
          ]
        ],
        "to": [
          1,
          [
            0.5,
            0.5
          ]
        ]
      },
      "image": "galets.jpeg",
      "duration": 24000,
      "transitionNext": {
        "name": "swap",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "easing": [
          0.03308823529411765,
          0.9666666666666667,
          0.6544117647058824,
          0.9962962962962963
        ],
        "from": [
          0.49609981043663076,
          [
            0.27358490566037735,
            0.5378151260504201
          ]
        ],
        "to": [
          0.9915548754657881,
          [
            0.5,
            0.5
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "cube",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "from": [
          1,
          [
            0.5,
            0.5
          ]
        ],
        "to": [
          0.44944005068826653,
          [
            0.49056603773584906,
            0.39399293286219084
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "name": "ripple",
        "duration": 8000
      }
    },
    {
      "kenburns": {
        "from": [
          0.9508542664436167,
          [
            0.33726415094339623,
            0.49645390070921985
          ]
        ],
        "to": [
          1,
          [
            0.5,
            0.5
          ]
        ]
      },
      "duration": 24000,
      "transitionNext": {
        "duration": 8000
      }
    }
];