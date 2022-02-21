/**
 * @license
 * Copyright 2022 Aglyn LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {BUILD_ID, PACKAGE_VERSION} from '@aglyn/shared-data-enums'
import {darken, mergeSxProps, styled} from '@aglyn/shared-feature-themes'
import {
  AglynSvgLogo,
  AppLink,
  type AppLinkProps,
  ElevateOnScroll,
  GridButtons,
  type GridButtonsProps,
  Menu,
} from '@aglyn/shared-ui-jsx'
import {MdiIcon, type MdiIconProps} from '@aglyn/shared-ui-mdi-jsx'
import {_isArr, _isArrEmpty, _isObj} from '@aglyn/shared-util-guards'
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  type IconButtonProps,
  Tab as MuiTab,
  type TabProps as MuiTabProps,
  Tabs as MuiTabs,
  Toolbar,
  Typography,
} from '@mui/material'
import {cyan, purple} from '@mui/material/colors'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {Fragment, type ReactNode} from 'react'
import BreadcrumbsComponent, {type BreadcrumbsProps} from '../components/breadcrumbs.component'
import CopyrightComponent from '../components/copyright.component'
import {tailNavigation} from '../const'


const StyledBreadcrumbs = styled(BreadcrumbsComponent, {
  name: 'BreadcrumbsComponent',
})(({theme}) => ({
  marginTop: theme.spacing(1),
  color: darken(theme.palette.getContrastText(purple['600']), 0.12),

  ['& .AglynBreadcrumbs-item']: {
    color: 'inherit',
    ['&.AglynBreadcrumbs-last']: {
      color: theme.palette.getContrastText(purple['600']),
      fontWeight: theme.typography.fontWeightMedium,
    },
  },
}))

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  }
}

export const NAVIGATION_MAX_WIDTH = false
export const FOOTER_MAX_WIDTH = 'xl'

export interface QuickActionsMenuItem extends IconButtonProps {
  icon?: MdiIconProps
  avatar?: any
  dense?: boolean
  href?: any
  items?: QuickActionsMenuItem[]
}

export type NavTabItem = Partial<AppLinkProps<'text'> & MuiTabProps & {icon: MdiIconProps}>

export interface MainLayoutProps {
  children?: ReactNode | undefined
  title?: string
  tabBarTitle?: ReactNode
  centerNavigationItems?: Array<any>
  breadcrumbItems?: BreadcrumbsProps['items']
  navTabItems?: NavTabItem[]
  quickActionMenus?: QuickActionsMenuItem[]
  productName?: string
  footerNavItems?: GridButtonsProps['items']
  // aggregatedPageMeta: AggregatedPageMeta
  // currentUserContext: CurrentUserContextType
}

function MainLayoutRaw(props: MainLayoutProps) {
  const router = useRouter()
  const {
    children,
    title,
    centerNavigationItems,
    tabBarTitle,
    navTabItems,
    productName,
    footerNavItems,
    quickActionMenus: quickActions,
    breadcrumbItems,
  } = props
  const tabValue = navTabItems
    ? navTabItems
    .filter((i) => router.asPath.includes(i.href))
    .reduce((prev, current) => {
      const currentHref = (_isObj(current.href) ? current.href.paths : current.href) as string
      const prevHref = (_isObj(prev.href) ? prev.href.paths : prev.href) as string

      return currentHref.length > prevHref.length ? current : prev
    }, {}).href ?? false
    : false

  const buildIconButton = ({avatar, icon, children, ...rest}, i) => (
    <IconButton key={rest.id ?? rest['href'] ?? i} color="inherit" {...rest}>
      {avatar
        ? (
          <Avatar
            {...avatar}
            sx={mergeSxProps({
              backgroundColor: cyan[600],
            }, avatar.sx)}
          />
        )
        : icon ? (<MdiIcon {...icon} />) : null
      }
      {children}
    </IconButton>
  )

  const buildTextButton = (item, key) => (
    <AppLink
      key={key}
      componentVariant="button"
      color="inherit"
      sx={{p: item?.avatar ? 0.5 : undefined}}
      {...item}
    />
  )

  // eslint-disable-next-line react/display-name
  const buildNav = (id, actionBuilder) => (item, key) =>
    _isArr(item.items) ? (
      <Menu
        key={id + key}
        items={item.items}
        sx={{
          padding: [0.5, 0.25],
          '&:last-child': {
            paddingLeft: 0.75,
          },
        }}
      >
        {actionBuilder(item, key)}
      </Menu>
    ) : (
      <Fragment key={id + key}>{actionBuilder(item, key)}</Fragment>
    )

  return (
    <Fragment>
      <Head>
        <title>{`${title ?? 'Web App'}`}</title>
      </Head>
      <ElevateOnScroll
        renderProps={(elevated) => ({elevation: elevated ? 4 : 0})}
      >
        <AppBar
          component="header"
          color="transparent"
          position="sticky"
          variant="elevation"
        >
          <AppBar
            component={'div'}
            elevation={0}
            color="primary"
            position="relative"
            sx={{
              '&:before': {
                content: '" "',
                left: 0,
                right: 0,
                bottom: 0,
                height: 1,
                width: '100%',
                position: 'absolute',
                backgroundColor: 'divider',
              },
            }}
          >
            <Toolbar variant="dense">
              <Box
                component={'div'}
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  marginLeft: -0.25,
                }}
              >
                <Box
                  sx={{
                    height: '36px',
                    flex: '0 0 auto',
                    margin: [0.75, 0],
                    display: 'flex',
                    alignItems: 'center',
                    '& a': {
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                >
                  <AppLink hrefAs="/" color="inherit" href="/" underline="none">
                    <Box
                      component={'span'}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <AglynSvgLogo
                        color="inherit"
                        sx={[
                          {
                            // color: '#36ca94', // Hulu
                            color: 'secondary.light',
                            lineHeight: '22px',
                            height: 'auto',
                          },
                          (theme) => ({
                            fontSize: theme.typography.pxToRem(50),
                            [theme.breakpoints.up('md')]: {
                              fontSize: theme.typography.pxToRem(60),
                            },
                          }),
                        ]}
                      />
                    </Box>
                    {productName && (
                      <Box
                        component={'span'}
                        sx={[
                          {
                            color: 'common.white',
                            paddingLeft: 0.75,
                            fontWeight: 'fontWeightLight',
                            paddingBottom: '0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: '22px',
                          },
                          (theme) => ({
                            fontSize: theme.typography.pxToRem(20),
                            [theme.breakpoints.up('md')]: {
                              lineHeight: '24px',
                              fontSize: theme.typography.pxToRem(22),
                            },
                          }),
                        ]}
                      >
                        {` ${productName}`}
                      </Box>
                    )}
                  </AppLink>
                </Box>
              </Box>
              <Box
                component={'div'}
                sx={{
                  display: 'flex',
                  flexGrow: 1,
                  flexBasis: '72%',
                }}
              >
                {(centerNavigationItems ?? []).map(buildNav('cni', buildTextButton))}
              </Box>
              <Box
                component={'div'}
                sx={{display: 'flex'}}
              >
                {(quickActions ?? []).map(buildNav('qa', buildIconButton))}
              </Box>
            </Toolbar>
          </AppBar>
          {tabBarTitle || (_isArr(navTabItems) && !_isArrEmpty(navTabItems)) ? (
            <AppBar component="div" color="primary" elevation={0} position="static">
              <Toolbar>
                <MuiTabs
                  aria-label="area navigation"
                  indicatorColor="secondary"
                  scrollButtons="auto"
                  textColor="inherit"
                  value={tabValue ?? false}
                  variant="scrollable"
                  sx={{
                    '& .Mui-flexContainer': {
                      alignItems: 'center',
                    },
                    '& .Mui-indicator': {
                      height: '3px',
                      backgroundColor: 'unset',
                      '&:after': {
                        borderRadius: '3px 3px 0 0',
                        content: '" "',
                        display: 'block',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        margin: '0 auto',
                        width: '80%',
                        height: '100%',
                        backgroundColor: 'secondary.light',
                      },
                    },
                  }}
                >
                  {tabBarTitle && (
                    <Box
                      component={'div'}
                      sx={{
                        typography: 'h6',
                        paddingRight: 2,
                        fontWeight: 'fontWeightLight',
                      }}
                    >
                      {tabBarTitle}
                    </Box>
                  )}
                  {navTabItems && navTabItems.map(({icon, sx, ...item}, i) => (
                    <MuiTab
                      key={item.id ?? item['key'] ?? i}
                      // disableRipple
                      color="inherit"
                      href={item.href ?? ''}
                      icon={<MdiIcon {...icon} />}
                      label={item.label}
                      underline="none"
                      value={item.href ?? i}
                      wrapped
                      sx={mergeSxProps({
                        flexDirection: 'row',
                        '& > *:first-child': {
                          marginBottom: 0,
                          marginRight: 1,
                        },
                        '& .Mui-labelIcon': {
                          minHeight: '46px',
                          minWidth: 'auto',
                          paddingLeft: 0,
                          paddingRight: 0,
                          marginLeft: 4,
                          '&:first-child': {
                            marginLeft: 0,
                          },
                        },
                      }, sx)}
                      {...{component: AppLink} as any}
                      {...a11yProps(i)}
                      {...item}
                    />
                  ))}
                </MuiTabs>
              </Toolbar>
            </AppBar>
          ) : null}
        </AppBar>
      </ElevateOnScroll>
      <Box
        component={'main'}
        sx={{
          // marginTop: theme.spacing(-6),
          marginTop: (theme) => `${theme.mixins.toolbar.minHeight}px`,
        }}
      >
        {children}
      </Box>
      <footer>
        <Container maxWidth={FOOTER_MAX_WIDTH}>
          <Box
            component={'div'}
            sx={{
              mt: 6,
              pb: 1,
              pt: 2,
              borderTop: 1,
              display: 'flex',
              flexWrap: 'wrap',
              borderColor: 'divider',
              alignItems: 'center',
            }}
          >
            <Box
              component={'div'}
              sx={{
                flexGrow: 1,
                display: 'flex',
              }}
            >
              <CopyrightComponent />
            </Box>
            <Box
              component={'div'}
              sx={{display: 'flex'}}
            >
              <GridButtons
                spacing={1}
                ItemComponent={AppLink}
                items={footerNavItems.map((i) => ({
                  size: 'small',
                  componentVariant: 'button',
                  ...i,
                }))}
              />
            </Box>

            <Box
              alignItems="space-around"
              display="flex"
              flex="1 1 auto"
              flexBasis="100%"
              justifyContent="center"
            >
              <Typography align="center" color="textSecondary" variant="overline">
                <span>{`Version ${PACKAGE_VERSION}`}</span>
                {' '}
                <span>{`(${BUILD_ID})`}</span>
              </Typography>
            </Box>
          </Box>
        </Container>
      </footer>
    </Fragment>
  )
}

MainLayoutRaw.displayName = 'LayoutMainComponent'
MainLayoutRaw.defaultProps = {
  footerNavItems: tailNavigation as any,
  // aggregatedPageMeta: {} as any,
  // currentUserContext: {} as any,
}

export const LayoutMainComponent = /*withCurrentUserContext(withAggregatedPageMeta(*/MainLayoutRaw/*))*/
export default LayoutMainComponent
