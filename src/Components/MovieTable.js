import React, {useEffect, useState} from 'react';
import {Table, Space, Rate, Input, Button, Drawer, InputNumber, Form, message} from 'antd';
import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons';
import api from "./api/api";
import "./tableClass.css"

const {TextArea} = Input;


function MovieTable() {
  const [movieList, setMovieList] = useState();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [visibleNewMovieDrawer, setNewVisibleNewMovieDrawer] = useState("");

  const [newMovie, setNewMovie] = useState({
    movieName: null,
    rate: 0,
    releaseYear: 2021,
    type: null,
    details: null,
  });

  const layout = {
    labelCol: {
      span: 16,
    },
    wrapperCol: {
      span: 160,
    },
  };

  const columns = [
    {
      title: "Movie ",
      dataIndex: "movieName",
      key: "movieName",
      ...getColumnSearchProps('movieName'),
      sorter: (a, b) => a.length > b.length
    },
    {
      title: "Release Date ",
      dataIndex: "releaseYear",
      key: "releaseYear",
      sorter: {
        compare: (a, b) => a.releaseYear - b.releaseYear,
        multiple: 3,
      },
      ...getColumnSearchProps('releaseYear')
    },
    {
      title: "Type ",
      dataIndex: "type",
      key: "type",
      filters: [
        {
          text: "Science-Fiction",
          value: "Science-Fiction"
        },
        {
          text: "Action",
          value: "Action"
        },
        {
          text: "Comedy",
          value: "Comedy"
        },
        {
          text: "Drama",
          value: "Drama"
        },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      sorter: {
        /* Sıralama çalışmıyor Rate FIXED */
        compare: (a, b) => a.rate - b.rate,
        multiple: 3,
      },
      render: rate => (<Rate disabled defaultValue={rate}/>)
    }
  ]
  let searchInput = null;

  function getColumnSearchProps(dataIndex) {
    return {
      filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (<div style={{padding: 8}}>
          <Input
            ref={node => {

              searchInput = node;
            }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
            style={{width: 188, marginBottom: 8, display: 'block'}}
          /> <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined/>}
            size="small"
            style={{width: 90}}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({closeDropdown: false});
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
      onFilter: (value, record) =>
        record[dataIndex]
          ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
          : '', onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => searchInput.select(), 100);
        }
      },
      render: text =>
        searchedColumn === dataIndex ? (
          <Highlighter
            highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={text ? text.toString() : ''}
          />
        ) : (
          text
        )
    }
  }

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  function onClickAddNewMovieButton() {
    setNewVisibleNewMovieDrawer(true)

  }

  function closeAddNewMovieDrawer() {
    setNewVisibleNewMovieDrawer(false)

  }

  function onAddNewMovieValueChange(e, processName) {
    switch (processName) {
      case "rate":
        setNewMovie({
          ...newMovie,

          rate: e
        })
        break;
      case "releaseYear":
        setNewMovie({...newMovie, releaseYear: e})
        break;
      case "type":
        setNewMovie({...newMovie, type: e.target.value})
        break;
      case "details":
        setNewMovie({...newMovie, details: e.target.value})
        break;
      case "movieName":
        setNewMovie({...newMovie, movieName: e.target.value})
        break;
      default:
        console.log(e.target.value, processName, "it comes correctly but not in case")
    }


  }


  function saveNewMovieLastTime() {
    /* Kontrol eklenecek movieList state i ile */
    console.log(newMovie)
    api.createMovie(newMovie.movieName, newMovie.rate, newMovie.releaseYear, newMovie.type, newMovie.details)
      .then(r => {
        console.log("new movie added in our Database")
      })
      .catch(error => {
        message.error("There is an error happened");
        console.log("one error happened:", error.message)
      })
  }


  function saveNewMovie() {
    /* Kontrol eklenecek movieList state i ile */

    saveNewMovieLastTime();
  }


  /*
  movies = [
   {
     key
     name,
     releaseDate
     type
     rate
   }
  ]
   */
  useEffect(() => {
    api.getMovies().then((r) => {
      const newMovieList = r.data.movies.map((movie, index) => {
          /*return {
            ...movie,
            key: index
          }
          movie.key= movie.movieName+index */
          movie.key = movie.id + movie.movieName;
          return movie
        }
      );
      setMovieList(newMovieList);
      setNewMovie({
        releaseYear: 2021
      })

    })
    /*MovieTable için veriler çekilecek */

  }, [])


  return (
    <div>
      <div className={"tableClass"}>
        <Table
          dataSource={movieList}
          pagination={{position: ['bottomCenter']}}
          expandable={{
            expandedRowRender: record => <p style={{margin: 0}}>{record.details}</p>,
            /* Burada dikkat, records.details yemeyebilir */
            rowExpandable: record => record.details,
          }}

          columns={columns}/>
      </div>
      <Drawer
        title="Add a new Movie"
        placement={"top"}
        closable={true}
        onClose={closeAddNewMovieDrawer}
        visible={visibleNewMovieDrawer}
        key={"top"}
      >
        <div id={"drawer-Input-Form"}>
          <Form
            {...layout}
            name={"movieAddForm"}
            layout={"inline"}>
            <Form.Item label="Movie Name" rules={[
              {
                required: true,
              },
            ]}>
              <Input placeholder="Movie" onChange={(e) => onAddNewMovieValueChange(e, "movieName")}/>
            </Form.Item>
            <Form.Item label="Date:"
                       rules={[
                         {
                           required: true,
                         },
                       ]}>
              <InputNumber min={1900} max={2022} defaultValue={2021}
                           onChange={(e) => onAddNewMovieValueChange(e, "releaseYear")}/>
            </Form.Item>
            <Form.Item label="Type:">
              <Input placeholder="Action" onChange={(e) => onAddNewMovieValueChange(e, "type")}/>
            </Form.Item>
            <Form.Item label="Rate:">
              <Rate value={newMovie.rate} onChange={(e) => onAddNewMovieValueChange(e, "rate")}/>
            </Form.Item>


          </Form>
          <br/>
          <Form
            {...layout}
            name={"movieAddForm2"}
            layout={"inline"}>
            <Form.Item label="Details:">

              <TextArea placeholder="Details" showCount maxLength={250} autoSize={{minRows: 3, maxRows: 3}}
                        onChange={(e) => onAddNewMovieValueChange(e, "details")}/>
            </Form.Item>
            <Form.Item noStyle={true}>
              <Button className="newMovieSaveButtonClass" type="primary" shape="round" size={"Medium"}
                      onClick={() => saveNewMovie()}> Save </Button>
            </Form.Item>
          </Form>

        </div>
      </Drawer>

      <div className={"tableButtonsClass"}>
        <Button type="primary" shape="round" size={"Medium"} onClick={(e) => onClickAddNewMovieButton(e)}> Add new
          movie </Button>
      </div>
      <div id={"addNewMovieDrawer"}>

      </div>
    </div>
  );
}

export default MovieTable;