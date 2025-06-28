export const AURIENT_ABI = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_registrationWorkflows",
        type: "address",
        internalType: "address",
      },
      {
        name: "_licensingModule",
        type: "address",
        internalType: "address",
      },
      {
        name: "_pilTemplate",
        type: "address",
        internalType: "address",
      },
      {
        name: "_royaltyModule",
        type: "address",
        internalType: "address",
      },
      {
        name: "_royaltyPolicyLAP",
        type: "address",
        internalType: "address",
      },
      {
        name: "_licenseAttachmentWorkflows",
        type: "address",
        internalType: "address",
      },
      {
        name: "_wipToken",
        type: "address",
        internalType: "address",
      },
      {
        name: "_platformFeePercent",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "COLLECTION_NAME",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "COLLECTION_SYMBOL",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "MAX_SUPPLY",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint32",
        internalType: "uint32",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WIP_TOKEN",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IWIP",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimEarnings",
    inputs: [
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emergencyWithdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getActiveListings",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct HealthDataMarketplace.Listing[]",
        components: [
          {
            name: "listingId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "seller",
            type: "address",
            internalType: "address",
          },
          {
            name: "ipId",
            type: "address",
            internalType: "address",
          },
          {
            name: "priceIP",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "dataType",
            type: "string",
            internalType: "string",
          },
          {
            name: "active",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicensePrice",
    inputs: [
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicenseTermsId",
    inputs: [
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLicenseTokenId",
    inputs: [
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getListingsByDataType",
    inputs: [
      {
        name: "dataType",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct HealthDataMarketplace.Listing[]",
        components: [
          {
            name: "listingId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "seller",
            type: "address",
            internalType: "address",
          },
          {
            name: "ipId",
            type: "address",
            internalType: "address",
          },
          {
            name: "priceIP",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "dataType",
            type: "string",
            internalType: "string",
          },
          {
            name: "active",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserListings",
    inputs: [
      {
        name: "user",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct HealthDataMarketplace.Listing[]",
        components: [
          {
            name: "listingId",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "seller",
            type: "address",
            internalType: "address",
          },
          {
            name: "ipId",
            type: "address",
            internalType: "address",
          },
          {
            name: "priceIP",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "dataType",
            type: "string",
            internalType: "string",
          },
          {
            name: "active",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "createdAt",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "healthDataCollection",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ISPGNFT",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "healthDataMetadata",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "ipMetadataURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "ipMetadataHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "nftMetadataURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "nftMetadataHash",
        type: "bytes32",
        internalType: "bytes32",
      },
      {
        name: "dataType",
        type: "string",
        internalType: "string",
      },
      {
        name: "qualityMetrics",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "initializeHealthDataCollection",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ipToLicenseTermsId",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ipToLicenseTokenId",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCollectionInitialized",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isCollectionSetup",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "licenseAttachmentWorkflows",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ILicenseAttachmentWorkflows",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "licensingModule",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ILicensingModule",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listings",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "seller",
        type: "address",
        internalType: "address",
      },
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
      {
        name: "priceIP",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "dataType",
        type: "string",
        internalType: "string",
      },
      {
        name: "active",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "createdAt",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "listingsByDataType",
    inputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextListingId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "pilTemplate",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPILicenseTemplate",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "platformFeePercent",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "purchaseLicense",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "registerHealthDataIP",
    inputs: [
      {
        name: "dataType",
        type: "string",
        internalType: "string",
      },
      {
        name: "ipfsHash",
        type: "string",
        internalType: "string",
      },
      {
        name: "priceIP",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "qualityMetrics",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "ipId",
        type: "address",
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "licenseTermsId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registrationWorkflows",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IRegistrationWorkflows",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeListing",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "royaltyModule",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IRoyaltyModule",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "royaltyPolicyLAP",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "royaltyWorkflows",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract RoyaltyWorkflows",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setPlatformFee",
    inputs: [
      {
        name: "feePercent",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [
      {
        name: "newOwner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "userListings",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawPlatformFees",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "CollectionInitialized",
    inputs: [
      {
        name: "collectionAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "EarningsClaimed",
    inputs: [
      {
        name: "ipId",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "HealthDataRegistered",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ipId",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tokenId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "dataType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "priceIP",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "LicensePurchased",
    inputs: [
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ipId",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "listingId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingCreated",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "ipId",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceIP",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "dataType",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "ListingRemoved",
    inputs: [
      {
        name: "listingId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlatformFeeUpdated",
    inputs: [
      {
        name: "oldFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "newFee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PlatformFeesWithdrawn",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "CollectionAlreadyInitialized",
    inputs: [],
  },
  {
    type: "error",
    name: "CollectionNotInitialized",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientPayment",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidDataType",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPrice",
    inputs: [],
  },
  {
    type: "error",
    name: "ListingNotActive",
    inputs: [],
  },
  {
    type: "error",
    name: "ListingNotFound",
    inputs: [],
  },
  {
    type: "error",
    name: "NoEarningsToClaim",
    inputs: [],
  },
  {
    type: "error",
    name: "NotIPOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "NotListingOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: [],
  },
  {
    type: "error",
    name: "ZeroAddress",
    inputs: [],
  },
];
