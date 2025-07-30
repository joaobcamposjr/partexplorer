package models

// Converter functions to clean models

func ToCleanBrand(brand *Brand) CleanBrand {
	if brand == nil {
		return CleanBrand{}
	}
	return CleanBrand{
		Name:    brand.Name,
		LogoURL: brand.LogoURL,
	}
}

func ToCleanFamily(family Family) CleanFamily {
	return CleanFamily{
		Description: family.Description,
	}
}

func ToCleanSubfamily(subfamily Subfamily) CleanSubfamily {
	return CleanSubfamily{
		Description: subfamily.Description,
		Family:      ToCleanFamily(subfamily.Family),
	}
}

func ToCleanProductType(productType *ProductType) *CleanProductType {
	if productType == nil {
		return nil
	}
	return &CleanProductType{
		Description: productType.Description,
		Subfamily:   ToCleanSubfamily(productType.Subfamily),
	}
}

func ToCleanPartGroupDimension(dimension *PartGroupDimension) *CleanPartGroupDimension {
	if dimension == nil {
		return nil
	}
	return &CleanPartGroupDimension{
		LengthMM: dimension.LengthMM,
		WidthMM:  dimension.WidthMM,
		HeightMM: dimension.HeightMM,
		WeightKG: dimension.WeightKG,
	}
}

func ToCleanPartName(partName PartName) CleanPartName {
	return CleanPartName{
		Name: partName.Name,
		Type: partName.Type,
	}
}

func ToCleanPartNames(partNames []PartName) []CleanPartName {
	cleanNames := make([]CleanPartName, len(partNames))
	for i, partName := range partNames {
		cleanNames[i] = ToCleanPartName(partName)
	}
	return cleanNames
}

func ToCleanPartImage(partImage PartImage) CleanPartImage {
	return CleanPartImage{
		URL: partImage.URL,
	}
}

func ToCleanPartImages(partImages []PartImage) []CleanPartImage {
	cleanImages := make([]CleanPartImage, len(partImages))
	for i, partImage := range partImages {
		cleanImages[i] = ToCleanPartImage(partImage)
	}
	return cleanImages
}

func ToCleanApplication(application Application) CleanApplication {
	return CleanApplication{
		Line:           application.Line,
		Manufacturer:   application.Manufacturer,
		Model:          application.Model,
		Version:        application.Version,
		Generation:     application.Generation,
		Engine:         application.Engine,
		Body:           application.Body,
		Fuel:           application.Fuel,
		YearStart:      application.YearStart,
		YearEnd:        application.YearEnd,
		Reliable:       application.Reliable,
		Adaptation:     application.Adaptation,
		AdditionalInfo: application.AdditionalInfo,
		Cylinders:      application.Cylinders,
		HP:             application.HP,
		Image:          application.Image,
	}
}

func ToCleanApplications(applications []Application) []CleanApplication {
	cleanApplications := make([]CleanApplication, len(applications))
	for i, application := range applications {
		cleanApplications[i] = ToCleanApplication(application)
	}
	return cleanApplications
}

func ToCleanCompany(company *Company) CleanCompany {
	if company == nil {
		return CleanCompany{}
	}
	return CleanCompany{
		Name:         company.Name,
		ImageURL:     company.ImageURL,
		Street:       company.Street,
		Number:       company.Number,
		Neighborhood: company.Neighborhood,
		City:         company.City,
		Country:      company.Country,
		State:        company.State,
		ZipCode:      company.ZipCode,
		Phone:        company.Phone,
		Mobile:       company.Mobile,
		Email:        company.Email,
		Website:      company.Website,
	}
}

func ToCleanStock(stock Stock) CleanStock {
	return CleanStock{
		Quantity: stock.Quantity,
		Price:    stock.Price,
		Company:  ToCleanCompany(stock.Company),
	}
}

func ToCleanStocks(stocks []Stock) []CleanStock {
	cleanStocks := make([]CleanStock, len(stocks))
	for i, stock := range stocks {
		cleanStocks[i] = ToCleanStock(stock)
	}
	return cleanStocks
}

func ToCleanPartGroup(partGroup PartGroup) CleanPartGroup {
	return CleanPartGroup{
		Discontinued: partGroup.Discontinued,
		ProductType:  ToCleanProductType(partGroup.ProductType),
		Dimension:    ToCleanPartGroupDimension(partGroup.Dimension),
	}
}

func ToCleanSearchResult(searchResult SearchResult) CleanSearchResult {
	return CleanSearchResult{
		PartGroup:    ToCleanPartGroup(searchResult.PartGroup),
		Names:        ToCleanPartNames(searchResult.Names),
		Images:       ToCleanPartImages(searchResult.Images),
		Applications: ToCleanApplications(searchResult.Applications),
		Stocks:       ToCleanStocks(searchResult.Stocks),
		Score:        searchResult.Score,
	}
}

func ToCleanSearchResponse(searchResponse *SearchResponse) *CleanSearchResponse {
	if searchResponse == nil {
		return nil
	}

	cleanResults := make([]CleanSearchResult, len(searchResponse.Results))
	for i, result := range searchResponse.Results {
		cleanResults[i] = ToCleanSearchResult(result)
	}

	return &CleanSearchResponse{
		Results:    cleanResults,
		Total:      searchResponse.Total,
		Page:       searchResponse.Page,
		PageSize:   searchResponse.PageSize,
		TotalPages: searchResponse.TotalPages,
		Query:      searchResponse.Query,
	}
}
