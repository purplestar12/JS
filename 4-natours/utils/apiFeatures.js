class APIFeatures {
  constructor(queryPrototype, reqQuery) {
    this.queryPrototype = queryPrototype;
    this.reqQuery = reqQuery;
  }
  filer() {
    const queryObj = { ...this.reqQuery }; //take the fields out of the obj & create a new obj
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((ele) => delete queryObj[ele]);

    //  1B. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    this.queryPrototype = this.queryPrototype.find(
      JSON.parse(queryStr),
    );
    return this;
  }
  sortByFields() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.queryPrototype = this.queryPrototype.sort(sortBy); //query.sort('price, -ratingsAverage')
    } else {
      this.queryPrototype = this.queryPrototype.sort('_id'); //'-' minus symbol is used for descending order
    }
    return this;
  }

  displayFields() {
    if (this.reqQuery.fields) {
      const selectFields = this.reqQuery.fields.split(',').join(' ');
      this.queryPrototype = this.queryPrototype.select(selectFields);
    } else {
      this.queryPrototype = this.queryPrototype.select('-__v'); //'-' minus symbol is used to deselect the field
    }
    return this;
  }

  paginate() {
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 100;
    const skipNum = (page - 1) * limit;
    this.queryPrototype = this.queryPrototype
      .skip(skipNum)
      .limit(limit); //query.skip(<NUM_OF_DOC_TO_BE_SKIPPED>).limit(<NUM_OF_DOC_SHOWN_PER_PAGE>)
    return this;
  }
}

module.exports = APIFeatures;
