// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             (unknown)
// source: api/v1/project.proto

package project

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// ProjectServiceClient is the client API for ProjectService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type ProjectServiceClient interface {
	CreateProject(ctx context.Context, in *ProjectRequest, opts ...grpc.CallOption) (ProjectService_CreateProjectClient, error)
}

type projectServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewProjectServiceClient(cc grpc.ClientConnInterface) ProjectServiceClient {
	return &projectServiceClient{cc}
}

func (c *projectServiceClient) CreateProject(ctx context.Context, in *ProjectRequest, opts ...grpc.CallOption) (ProjectService_CreateProjectClient, error) {
	stream, err := c.cc.NewStream(ctx, &ProjectService_ServiceDesc.Streams[0], "/api.v1.ProjectService/CreateProject", opts...)
	if err != nil {
		return nil, err
	}
	x := &projectServiceCreateProjectClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type ProjectService_CreateProjectClient interface {
	Recv() (*ProjectResponse, error)
	grpc.ClientStream
}

type projectServiceCreateProjectClient struct {
	grpc.ClientStream
}

func (x *projectServiceCreateProjectClient) Recv() (*ProjectResponse, error) {
	m := new(ProjectResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

// ProjectServiceServer is the server API for ProjectService service.
// All implementations should embed UnimplementedProjectServiceServer
// for forward compatibility
type ProjectServiceServer interface {
	CreateProject(*ProjectRequest, ProjectService_CreateProjectServer) error
}

// UnimplementedProjectServiceServer should be embedded to have forward compatible implementations.
type UnimplementedProjectServiceServer struct {
}

func (UnimplementedProjectServiceServer) CreateProject(*ProjectRequest, ProjectService_CreateProjectServer) error {
	return status.Errorf(codes.Unimplemented, "method CreateProject not implemented")
}

// UnsafeProjectServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to ProjectServiceServer will
// result in compilation errors.
type UnsafeProjectServiceServer interface {
	mustEmbedUnimplementedProjectServiceServer()
}

func RegisterProjectServiceServer(s grpc.ServiceRegistrar, srv ProjectServiceServer) {
	s.RegisterService(&ProjectService_ServiceDesc, srv)
}

func _ProjectService_CreateProject_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(ProjectRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ProjectServiceServer).CreateProject(m, &projectServiceCreateProjectServer{stream})
}

type ProjectService_CreateProjectServer interface {
	Send(*ProjectResponse) error
	grpc.ServerStream
}

type projectServiceCreateProjectServer struct {
	grpc.ServerStream
}

func (x *projectServiceCreateProjectServer) Send(m *ProjectResponse) error {
	return x.ServerStream.SendMsg(m)
}

// ProjectService_ServiceDesc is the grpc.ServiceDesc for ProjectService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var ProjectService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "api.v1.ProjectService",
	HandlerType: (*ProjectServiceServer)(nil),
	Methods:     []grpc.MethodDesc{},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "CreateProject",
			Handler:       _ProjectService_CreateProject_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "api/v1/project.proto",
}