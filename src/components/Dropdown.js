import "../index.css";
import { ReactComponent as ArrowIcon } from "../assets/icons/arrow.svg";
import { ReactComponent as BoltIcon } from "../assets/icons/bolt.svg";
import { ReactComponent as RightArrowIcon } from "../assets/icons/right-arrow.svg";

import React, { useState, useEffect, useRef } from "react";
import { CSSTransition } from "react-transition-group";

import Axios from "axios";
import Modal from "./Modal/Modal";

function Dropdown() {
  //menu state
  const [activeMenu, setActiveMenu] = useState("main");
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
  //fetch data state
  const [categoryList, setCategoryList] = useState([]);
  const [linklv1List, setLinkLv1List] = useState([]);
  const [linkList, setLinkList] = useState([]);
  const [linkName, setLinkName] = useState();
  //modal state
  const [show, setShow] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalLink, setModalLink] = useState("");

  //set flexible height of dropdown / menu
  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight);
  }, []);

  //calculation height in every level based on amount of child
  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  //get category (level 1)
  useEffect(() => {
    Axios.get("http://localhost:3001/api/get").then((response) => {
      console.log(response);
      setCategoryList(response.data);
    });
  }, []);

  //get link without category (level 1)
  useEffect(() => {
    Axios.get("http://localhost:3001/api/get-lv1-link").then((response) => {
      console.log(response);
      setLinkLv1List(response.data);
    });
  }, []);

  //get links based on category (level 2)
  useEffect(() => {
    Axios.get(`http://localhost:3001/api/getlinks/${linkName}`).then(
      (response) => {
        console.log(response);
        setLinkList(response.data);
      }
    );
  }, [linkName]);

  //handle clik onclick menu category and links
  function handleClick(nameLink, linkHref) {
    // e.preventDefault();
    console.log(`You clicked ${nameLink}`);
    setLinkName(nameLink);
    nameLink === "main" || nameLink === ""
      ? handleClickMain()
      : setActiveMenu(nameLink);
    linkHref ? openInNewTab(linkHref) : setActiveMenu(nameLink);
  }

  //handle click on menu back
  function handleClickMain() {
    setActiveMenu("main");
    setLinkName("");
  }

  //handle click links
  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  //handle clik to show modal
  function handleClickLeftIcon(modalTitle, modalBody, modalLink, e) {
    if (modalLink) {
      setModalTitle(modalTitle);
      setModalBody(modalBody);
      setModalLink(modalLink);
      setShow(true);
      e.stopPropagation();
      e.preventDefault();
    }
  }

  //per menu-item content
  function DropdownItem(props) {
    return (
      <a
        href="#"
        className="menu-item-custom"
        onClick={() => handleClick(props.goToMenu, props.goHref)}
      >
        <span
          className="icon-button-custom"
          onClick={(e) => {
            handleClickLeftIcon(
              props.goToMenu,
              props.goToMenu,
              props.goHref,
              e
            );
          }}
        >
          {props.leftIcon}
        </span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  //based content
  return (
    <>
      <Modal
        onClose={() => setShow(false)}
        show={show}
        modalTitle={modalTitle}
        modalBody={modalBody}
        modalLink={modalLink}
      />
      <div className="dropdown col-md-12">
        {/* level 1 */}
        <CSSTransition
          in={activeMenu === "main"}
          timeout={500}
          classNames="menu-primary"
          unmountOnExit
          onEnter={calcHeight}
        >
          <div className="menu">
            {categoryList.map((val) => {
              return (
                <DropdownItem
                  leftIcon={val.icon}
                  goToMenu={val.id}
                  key={val.id}
                  rightIcon={<RightArrowIcon />}
                >
                  <h4>{val.name}</h4>
                </DropdownItem>
              );
            })}
            {linklv1List.map((val) => {
              return (
                <DropdownItem
                  goToMenu="main"
                  leftIcon={<BoltIcon />}
                  key={val.id}
                  goHref={val.link}
                >
                  {val.name}
                </DropdownItem>
              );
            })}
          </div>
        </CSSTransition>
        {/* level 2 */}
        <CSSTransition
          in={activeMenu === linkName}
          timeout={500}
          classNames="menu-secondary"
          unmountOnExit
          onEnter={calcHeight}
        >
          <div className="menu">
            <DropdownItem goToMenu="main" leftIcon={<ArrowIcon />}>
              <h4>Kembali</h4>
            </DropdownItem>

            {linkList.map((vallink) => {
              return (
                <DropdownItem
                  leftIcon={<BoltIcon />}
                  goToMenu={linkName}
                  goHref={vallink.link}
                >
                  {vallink.name}
                </DropdownItem>
              );
            })}
          </div>
        </CSSTransition>
      </div>
    </>
  );
}

export default Dropdown;
