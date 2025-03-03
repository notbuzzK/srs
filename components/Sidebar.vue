<template>
    <CSidebar unfoldable>
  <CSidebarHeader class="border-bottom">
    <CSidebarBrand>CUI</CSidebarBrand>
  </CSidebarHeader>
  <CSidebarNav>
    <CNavTitle>Nav Title</CNavTitle>
    <CNavItem href="#">
      <CIcon  customClassName="nav-icon" icon="cil-speedometer"/> Nav item
    </CNavItem>
    <CNavItem href="#">
      <CIcon  customClassName="nav-icon" icon="cil-speedometer"/> With badge
      <CBadge class="ms-auto" color="primary">NEW</CBadge>
    </CNavItem>
    <CNavGroup>
      <template #togglerContent>
        <CIcon  customClassName="nav-icon" icon="cil-puzzle"/> Nav dropdown
      </template>
      <CNavItem href="#">
        <span class="nav-icon"><span class="nav-icon-bullet"></span></span> Nav dropdown item
      </CNavItem>
      <CNavItem href="#">
        <span class="nav-icon"><span class="nav-icon-bullet"></span></span> Nav dropdown item
      </CNavItem>
    </CNavGroup>
    <CNavGroup>
      <template #togglerContent>
        <CIcon  customClassName="nav-icon" icon="cil-puzzle"/> Nav dropdown2
      </template>
      <CNavItem href="#">
        <span class="nav-icon"><span class="nav-icon-bullet"></span></span> Nav dropdown item
      </CNavItem>
      <CNavItem href="#">
        <span class="nav-icon"><span class="nav-icon-bullet"></span></span> Nav dropdown item
      </CNavItem>
    </CNavGroup>
    <CNavItem href="https://coreui.io">
      <CIcon customClassName="nav-icon" icon="cil-cloud-download" /> Download CoreUI
    </CNavItem>
    <CNavItem href="https://coreui.io/pro/">
      <CIcon customClassName="nav-icon" icon="cil-layers" /> Try CoreUI PRO
    </CNavItem>
  </CSidebarNav>
</CSidebar>
</template>