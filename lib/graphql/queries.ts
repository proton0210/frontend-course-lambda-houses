export const getUserDetails = /* GraphQL */ `
  query GetUserDetails($cognitoUserId: String!) {
    getUserDetails(cognitoUserId: $cognitoUserId) {
      userId
      cognitoUserId
      email
      firstName
      lastName
      contactNumber
      createdAt
      tier
    }
  }
`;

export const listMyProperties = /* GraphQL */ `
  query ListMyProperties($userId: String!, $limit: Int, $nextToken: String) {
    listMyProperties(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        price
        address
        city
        state
        zipCode
        bedrooms
        bathrooms
        squareFeet
        propertyType
        listingType
        images
        imageUrls
        submittedBy
        submittedAt
        updatedAt
        status
        contactName
        contactEmail
        contactPhone
        amenities
        yearBuilt
        lotSize
        parkingSpaces
        isPublic
      }
      nextToken
    }
  }
`;

export const listProperties = /* GraphQL */ `
  query ListProperties(
    $filter: PropertyFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProperties(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        price
        address
        city
        state
        zipCode
        bedrooms
        bathrooms
        squareFeet
        propertyType
        listingType
        images
        imageUrls
        submittedBy
        submittedAt
        updatedAt
        status
        contactName
        contactEmail
        contactPhone
        amenities
        yearBuilt
        lotSize
        parkingSpaces
        isPublic
      }
      nextToken
    }
  }
`;

export const getProperty = /* GraphQL */ `
  query GetProperty($id: ID!) {
    getProperty(id: $id) {
      id
      title
      description
      price
      address
      city
      state
      zipCode
      bedrooms
      bathrooms
      squareFeet
      propertyType
      listingType
      images
      submittedBy
      submittedAt
      updatedAt
      status
      contactName
      contactEmail
      contactPhone
      amenities
      yearBuilt
      lotSize
      parkingSpaces
      isPublic
    }
  }
`;

export const getReportStatus = /* GraphQL */ `
  query GetReportStatus($executionArn: String!) {
    getReportStatus(executionArn: $executionArn) {
      status
      reportId
      signedUrl
      s3Key
      error
    }
  }
`;

export const listMyReports = /* GraphQL */ `
  query ListMyReports($limit: Int, $nextToken: String) {
    listMyReports(limit: $limit, nextToken: $nextToken) {
      items {
        reportId
        fileName
        reportType
        propertyTitle
        createdAt
        size
        signedUrl
        s3Key
      }
      nextToken
    }
  }
`;

export const listPendingProperties = /* GraphQL */ `
  query ListPendingProperties($limit: Int, $nextToken: String) {
    listPendingProperties(limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        price
        address
        city
        state
        zipCode
        bedrooms
        bathrooms
        squareFeet
        propertyType
        listingType
        images
        status
        submittedAt
        submittedBy
        contactName
        contactEmail
        contactPhone
      }
      nextToken
    }
  }
`;