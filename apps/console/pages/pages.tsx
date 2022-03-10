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

import {ICON_VARIANT_PAGES} from '@aglyn/shared-data-enums'
import {Container} from '@mui/material'
import {CONTENT_MAX_WIDTH} from '../constants/shared'
import LayoutDashboardComponent from '../layouts/layout-dashboard.component'


export function Pages(props) {

  console.log('Pages props', props)


  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.@emotion/styled file.
   */
  return (
    <Container sx={{py: 3}} maxWidth={CONTENT_MAX_WIDTH}>


    </Container>
  )
}
Pages.displayName = 'Page:Pages'
Pages.layoutComponent = LayoutDashboardComponent
Pages.layoutProps = {
  LayoutConsoleComponent: {
    title: 'My Pages',
  },
  LayoutDashboardComponent: {
    header: {
      children: 'My Pages',
      icon: {path: ICON_VARIANT_PAGES.path},
    },
    breadcrumbItems: [
      {
        children: 'Pages',
      },
    ],
  },
}

export default Pages
