"use client"

import * as React from "react"
import {
  IconUser,
  IconBuilding,
  IconCrown,
  IconEye,
  IconCheck,
  IconX,
  IconMoreHorizontal,
  IconSearch,
  IconFilter,
  IconShield,
  IconMail,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// 사용자 관리 데이터 (실제 구현에서는 Supabase에서 가져올 예정)
const userData = {
  pendingApprovals: [
    {
      id: "1",
      email: "creator1@example.com",
      fullName: "김창작",
      role: "creator",
      appliedAt: new Date("2024-07-30T10:30:00"),
      category: ["뷰티", "패션"],
      followerCount: 15000,
      engagementRate: 3.2,
      portfolioLinks: ["https://instagram.com/creator1", "https://youtube.com/creator1"]
    },
    {
      id: "2",
      email: "business1@example.com",
      fullName: "박사업",
      role: "business",
      appliedAt: new Date("2024-07-29T14:15:00"),
      companyName: "혁신마케팅",
      businessRegistration: "123-45-67890",
      website: "https://innovamarketing.co.kr"
    },
    {
      id: "3",
      email: "creator2@example.com",
      fullName: "이콘텐츠",
      role: "creator",
      appliedAt: new Date("2024-07-29T09:45:00"),
      category: ["음식", "여행"],
      followerCount: 8500,
      engagementRate: 4.1,
      portfolioLinks: ["https://tiktok.com/@creator2"]
    },
  ],
  recentUsers: [
    {
      id: "4",
      email: "verified@example.com",
      fullName: "최승인",
      role: "creator",
      status: "active",
      joinedAt: new Date("2024-07-28T16:20:00"),
      lastActive: new Date("2024-07-30T11:30:00"),
    },
    {
      id: "5",
      email: "business2@example.com",
      fullName: "정기업",
      role: "business",
      status: "active",
      joinedAt: new Date("2024-07-27T10:10:00"),
      lastActive: new Date("2024-07-30T09:15:00"),
    },
    {
      id: "6",
      email: "suspended@example.com",
      fullName: "한정지",
      role: "creator",
      status: "suspended",
      joinedAt: new Date("2024-07-25T13:40:00"),
      lastActive: new Date("2024-07-26T15:20:00"),
    },
  ]
}

function getRoleIcon(role: string) {
  switch (role) {
    case "creator":
      return IconUser
    case "business":
      return IconBuilding
    case "admin":
      return IconCrown
    default:
      return IconUser
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "creator":
      return "크리에이터"
    case "business":
      return "비즈니스"
    case "admin":
      return "관리자"
    default:
      return role
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">활성</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">정지</Badge>
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">대기</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}일 전`
  } else if (hours > 0) {
    return `${hours}시간 전`
  } else {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}분 전`
  }
}

export function AdminUserManagement() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleApprove = async (userId: string) => {
    // 실제 구현에서는 Supabase API 호출
    console.log("승인:", userId)
  }

  const handleReject = async (userId: string) => {
    // 실제 구현에서는 Supabase API 호출
    console.log("거부:", userId)
  }

  const handleUserAction = async (userId: string, action: string) => {
    // 실제 구현에서는 Supabase API 호출
    console.log(`사용자 ${userId}에게 ${action} 실행`)
  }

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader>
        <div className="flex flex-col space-y-1.5 @md/main:flex-row @md/main:items-center @md/main:justify-between @md/main:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="h-5 w-5" />
              사용자 관리
            </CardTitle>
            <CardDescription>
              승인 대기 중인 사용자와 전체 사용자를 관리합니다
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="사용자 검색..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <IconFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              승인 대기
              <Badge variant="secondary" className="ml-1">
                {userData.pendingApprovals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              전체 사용자
            </TabsTrigger>
          </TabsList>
          
          {/* 승인 대기 사용자 */}
          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-4">
              {userData.pendingApprovals.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {user.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{user.fullName}</h4>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {React.createElement(getRoleIcon(user.role), { className: "h-3 w-3" })}
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <IconMail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                        
                        {user.role === "creator" && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm">
                              <span>팔로워: {user.followerCount?.toLocaleString()}명</span>
                              <span>참여율: {user.engagementRate}%</span>
                            </div>
                            <div className="flex gap-1">
                              {user.category?.map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {user.role === "business" && (
                          <div className="space-y-1 text-sm">
                            <div>회사명: {user.companyName}</div>
                            <div>사업자등록번호: {user.businessRegistration}</div>
                            {user.website && (
                              <div>웹사이트: 
                                <a 
                                  href={user.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline ml-1"
                                >
                                  {user.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          신청일: {formatTimeAgo(user.appliedAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(user.id)}
                      >
                        <IconCheck className="h-4 w-4" />
                        승인
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(user.id)}
                      >
                        <IconX className="h-4 w-4" />
                        거부
                      </Button>
                      <Button variant="outline" size="sm">
                        <IconEye className="h-4 w-4" />
                        상세보기
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {userData.pendingApprovals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  승인 대기 중인 사용자가 없습니다.
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 전체 사용자 */}
          <TabsContent value="users">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>최근 활동</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {user.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {React.createElement(getRoleIcon(user.role), { className: "h-3 w-3" })}
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.joinedAt.toLocaleDateString("ko-KR")}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimeAgo(user.lastActive)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <IconMoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, "view")}>
                              <IconEye className="h-4 w-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, "edit")}>
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "suspend")}
                                className="text-red-600"
                              >
                                계정 정지
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, "activate")}
                                className="text-green-600"
                              >
                                계정 활성화
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}